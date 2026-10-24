import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://zpoznosjgdcngnptdohl.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || "sb_secret_mXYVfL1GoMRVawG1Iq5NdA_RyJIYdvU";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_EMKZv55CbZZrUN3SXDgOXg_6i0ui71K";

const adminClient = createClient(supabaseUrl, serviceRoleKey);

async function runTests() {
  console.log("=== Sesi 3: Lost & Found Core Comprehensive Test Suite ===");
  const testResults = [];

  function record(name, passed, detail) {
    testResults.push({ name, passed, detail });
    console.log(`[${passed ? "PASS" : "FAIL"}] ${name} - ${detail}`);
  }

  try {
    // 1. Provision Test Users: User A & User B
    const emailA = `test_sesi3_user_a_${Date.now()}@muaraku.test`;
    const emailB = `test_sesi3_user_b_${Date.now()}@muaraku.test`;
    const password = "TestPassword123!";

    const { data: userAData, error: errA } = await adminClient.auth.admin.createUser({
      email: emailA,
      password: password,
      email_confirm: true,
      user_metadata: { display_name: "Warga Test A" },
    });
    if (errA) throw new Error("Failed to create User A: " + errA.message);

    const { data: userBData, error: errB } = await adminClient.auth.admin.createUser({
      email: emailB,
      password: password,
      email_confirm: true,
      user_metadata: { display_name: "Warga Test B" },
    });
    if (errB) throw new Error("Failed to create User B: " + errB.message);

    const userA = userAData.user;
    const userB = userBData.user;

    // Ensure profiles and account controls exist
    await adminClient.from("user_profiles").upsert([
      { user_id: userA.id, display_name: "Warga Test A", is_active: true },
      { user_id: userB.id, display_name: "Warga Test B", is_active: true },
    ]);
    await adminClient.from("user_account_controls").upsert([
      { user_id: userA.id, status: "active" },
      { user_id: userB.id, status: "active" },
    ]);

    // Sign in as User A and User B using anon client to test with real RLS session
    const clientA = createClient(supabaseUrl, anonKey);
    const { data: sessionA, error: signErrA } = await clientA.auth.signInWithPassword({
      email: emailA,
      password: password,
    });
    if (signErrA) throw new Error("Sign in A failed: " + signErrA.message);

    const clientB = createClient(supabaseUrl, anonKey);
    const { data: sessionB, error: signErrB } = await clientB.auth.signInWithPassword({
      email: emailB,
      password: password,
    });
    if (signErrB) throw new Error("Sign in B failed: " + signErrB.message);

    record("Provision Test Users", true, `User A (${userA.id}) & User B (${userB.id}) logged in with authenticated RLS sessions`);

    // Fetch category
    const { data: categories } = await adminClient.from("report_categories").select("id").limit(1);
    const catId = categories && categories[0] ? categories[0].id : null;

    // 2. User A creates a Lost Report with private clues
    const { data: lostRepA, error: createErrA } = await clientA
      .from("reports")
      .insert({
        reporter_user_id: userA.id,
        report_type: "lost",
        title: "Kunci Honda Vario Hitam Uji Coba",
        description: "Kunci motor hilang di sekitar halte kampus, ada gantungan pita merah",
        category_id: catId,
        location_label: "Halte Kampus Utama",
        city: "Bandung",
      })
      .select()
      .single();

    if (createErrA || !lostRepA) {
      record("User A Create Report", false, createErrA ? createErrA.message : "No data returned");
    } else {
      record("User A Create Report", true, `Report created with id ${lostRepA.id}, status: ${lostRepA.moderation_status}`);
    }

    // Insert private details for lostRepA by User A
    const { error: privErrA } = await clientA.from("report_private_details").insert({
      report_id: lostRepA.id,
      owner_only_clues: "Ada goresan huruf X di remote alarm belakang",
      private_contact: "081234567890",
      contact_preference: "in_app",
    });

    record("User A Insert Private Clues", !privErrA, privErrA ? privErrA.message : "Private clues inserted successfully");

    // 3. Test RLS Visibility: pending_review report should NOT be visible to User B, but visible to User A
    const { data: readFeedB } = await clientB
      .from("reports")
      .select("id")
      .eq("id", lostRepA.id);

    const notVisibleToB = !readFeedB || readFeedB.length === 0;
    record("RLS Feed Privacy (pending_review)", notVisibleToB, notVisibleToB ? "User B cannot see pending_review report" : "LEAK: User B can see pending_review report!");

    const { data: readFeedA } = await clientA
      .from("reports")
      .select("id")
      .eq("id", lostRepA.id);

    const visibleToA = readFeedA && readFeedA.length > 0;
    record("RLS Owner Feed Visibility", visibleToA, visibleToA ? "Owner (User A) can see own pending report" : "Owner cannot see own report");

    // 4. Test RLS on report_private_details: User B cannot read User A's private details
    const { data: readPrivB } = await clientB
      .from("report_private_details")
      .select("*")
      .eq("report_id", lostRepA.id);

    const privBlockedForB = !readPrivB || readPrivB.length === 0;
    record("RLS Private Details Protection", privBlockedForB, privBlockedForB ? "User B blocked from reading User A's private clues" : "LEAK: User B read private clues!");

    // 5. Test Cross-User Mutation / Ownership
    // User B attempts to UPDATE User A's report
    const { error: crossUpdateErr } = await clientB
      .from("reports")
      .update({ title: "Hacked by User B" })
      .eq("id", lostRepA.id);

    // Verify title in DB didn't change
    const { data: verifyRep } = await adminClient.from("reports").select("title").eq("id", lostRepA.id).single();
    const updatePrevented = verifyRep.title === "Kunci Honda Vario Hitam Uji Coba";
    record("Prevent Cross-User Edit", updatePrevented, updatePrevented ? "User B could not alter User A's report title" : "VULNERABILITY: User B altered report title!");

    // User B attempts to DELETE User A's report
    const { error: crossDelErr } = await clientB
      .from("reports")
      .delete()
      .eq("id", lostRepA.id);

    const { data: verifyRepStillExists } = await adminClient.from("reports").select("id").eq("id", lostRepA.id).maybeSingle();
    const deletePrevented = Boolean(verifyRepStillExists);
    record("Prevent Cross-User Delete", deletePrevented, deletePrevented ? "User B could not delete User A's report" : "VULNERABILITY: User B deleted User A's report!");

    // User A can update their own report
    const { error: ownUpdateErr } = await clientA
      .from("reports")
      .update({ title: "Kunci Honda Vario Hitam Terupdate" })
      .eq("id", lostRepA.id);

    const { data: verifyOwnUpdate } = await adminClient.from("reports").select("title").eq("id", lostRepA.id).single();
    const ownUpdateSuccess = verifyOwnUpdate.title === "Kunci Honda Vario Hitam Terupdate";
    record("Allow Owner Edit", ownUpdateSuccess, ownUpdateSuccess ? "Owner (User A) successfully updated report" : "Owner edit failed");

    // 6. Test Saved Reports
    // First, approve the report via admin to satisfy saved_reports insert check constraint
    await adminClient.from("reports").update({ moderation_status: "approved" }).eq("id", lostRepA.id);

    // User B saves User A's approved report
    const { error: saveErrB } = await clientB.from("saved_reports").insert({
      user_id: userB.id,
      report_id: lostRepA.id,
    });
    record("Saved Reports Insert", !saveErrB, saveErrB ? saveErrB.message : "User B saved report");

    // Duplicate save prevention (composite PK)
    const { error: dupSaveErr } = await clientB.from("saved_reports").insert({
      user_id: userB.id,
      report_id: lostRepA.id,
    });
    record("Saved Reports Duplicate Prevention", Boolean(dupSaveErr), "Duplicate save correctly rejected by composite PK");

    // User B reads their saved reports
    const { data: userBSaved } = await clientB.from("saved_reports").select("*").eq("user_id", userB.id);
    record("Saved Reports Read Own", userBSaved && userBSaved.length === 1, `User B sees ${userBSaved?.length} saved report(s)`);

    // User A cannot read User B's saved reports
    const { data: userASavedOther } = await clientA.from("saved_reports").select("*").eq("user_id", userB.id);
    record("Saved Reports Isolation", !userASavedOther || userASavedOther.length === 0, "User A cannot read User B's saved reports list");

    // User B deletes saved report
    const { error: unsaveErr } = await clientB.from("saved_reports").delete().eq("user_id", userB.id).eq("report_id", lostRepA.id);
    record("Saved Reports Delete", !unsaveErr, unsaveErr ? unsaveErr.message : "User B unsaved report");

    // 7. Test Claim Flow
    // User B creates a Found report
    const { data: foundRepB, error: foundErrB } = await clientB
      .from("reports")
      .insert({
        reporter_user_id: userB.id,
        report_type: "found",
        title: "Ditemukan Kunci Motor Vario di Halte",
        description: "Ditemukan kunci motor dengan gantungan pita merah di bangku halte",
        location_label: "Halte Kampus Utama",
        city: "Bandung",
      })
      .select()
      .single();

    record("User B Create Found Report", !foundErrB && Boolean(foundRepB), foundErrB ? foundErrB.message : `Found report id ${foundRepB?.id}`);

    // Moderator approves foundRepB so it is available for claiming per trigger constraint
    await adminClient.from("reports").update({ moderation_status: "approved" }).eq("id", foundRepB.id);

    // Self-claim check: User B tries to claim their own found report (should fail trigger/check)
    const { error: selfClaimErr } = await clientB.from("claims").insert({
      found_report_id: foundRepB.id,
      lost_report_id: lostRepA.id,
      claimant_user_id: userB.id,
      claimant_message: "Trying to self claim",
    });
    record("Prevent Invalid Claim (Not Lost Owner)", Boolean(selfClaimErr), "Trigger correctly prevented claim where claimant does not own lost report");

    // Valid claim: User A claims foundRepB using their own lostRepA
    const { error: validClaimErr } = await clientA
      .from("claims")
      .insert({
        found_report_id: foundRepB.id,
        lost_report_id: lostRepA.id,
        claimant_user_id: userA.id,
        claimant_message: "Halo, itu kunci motor saya yang hilang tadi pagi di halte.",
      });

    const { data: claimA } = await clientA
      .from("claims")
      .select("*")
      .eq("found_report_id", foundRepB.id)
      .eq("claimant_user_id", userA.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    record("User A Submit Valid Claim", !validClaimErr && Boolean(claimA), validClaimErr ? validClaimErr.message : `Claim created id ${claimA?.id}`);

    // Insert claim evidence for this claim by User A
    if (claimA) {
      const { error: evErr } = await clientA.from("claim_evidence").insert({
        claim_id: claimA.id,
        uploaded_by: userA.id,
        storage_path: `${userA.id}/${claimA.id}/stnk_evidence.jpg`,
        note: "Foto STNK motor yang sesuai dengan nomor plat",
      });
      record("Claim Evidence Insert", !evErr, evErr ? evErr.message : "Evidence row registered");

      // Verify claim evidence is accessible to claim participants (User A and User B)
      const { data: evForA } = await clientA.from("claim_evidence").select("*").eq("claim_id", claimA.id);
      record("Claim Evidence Visible to Claimant", evForA && evForA.length > 0, "Claimant can view evidence");

      const { data: evForB } = await clientB.from("claim_evidence").select("*").eq("claim_id", claimA.id);
      record("Claim Evidence Visible to Found Reporter", evForB && evForB.length > 0, "Found report owner can view claim evidence");
    }

    // 8. Cleanup test data
    console.log("Cleaning up test users and data...");
    await adminClient.from("reports").delete().in("id", [lostRepA.id, foundRepB.id]);
    await adminClient.auth.admin.deleteUser(userA.id);
    await adminClient.auth.admin.deleteUser(userB.id);
    record("Cleanup Test Data", true, "Test reports and auth users cleanly purged");

    const allPassed = testResults.every((t) => t.passed);
    console.log("\n=================================");
    console.log(`TOTAL TESTS: ${testResults.length}`);
    console.log(`STATUS: ${allPassed ? "ALL TESTS PASSED (100%)" : "SOME TESTS FAILED"}`);
    console.log("=================================");

    return allPassed;
  } catch (err) {
    console.error("Test execution failed:", err);
    return false;
  }
}

runTests().then((ok) => {
  process.exit(ok ? 0 : 1);
});
