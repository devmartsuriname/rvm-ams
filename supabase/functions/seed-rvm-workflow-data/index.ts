import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ── Seed Data Definitions ──────────────────────────────────────────────

const SEED_USERS = [
  { email: "chair@rvm.local", fullName: "Chair — RVM Test", roleCode: "chair_rvm" },
  { email: "secretary@rvm.local", fullName: "Secretary — RVM Test", roleCode: "secretary_rvm" },
  { email: "member1@rvm.local", fullName: "Cabinet Member 1 — RVM Test", roleCode: "admin_dossier" },
  { email: "member2@rvm.local", fullName: "Cabinet Member 2 — RVM Test", roleCode: "admin_agenda" },
  { email: "observer@rvm.local", fullName: "Observer — RVM Test", roleCode: "audit_readonly" },
];

const SEED_PASSWORD = "TestSeed2026!";

const SEED_DOSSIERS = [
  { number: "RVM-SEED-001", title: "[SEED] Housing Subsidy Allocation Program", ministry: "Ministry of Social Affairs", serviceType: "proposal" as const, subtype: "OPA" as const, status: "draft" as const, urgency: "regular" as const },
  { number: "RVM-SEED-002", title: "[SEED] Transport Infrastructure Expansion", ministry: "Ministry of Public Works", serviceType: "proposal" as const, subtype: "ORAG" as const, status: "registered" as const, urgency: "urgent" as const },
  { number: "RVM-SEED-003", title: "[SEED] Digital Government Strategy", ministry: "Ministry of Communication", serviceType: "proposal" as const, subtype: "OPA" as const, status: "in_preparation" as const, urgency: "regular" as const },
  { number: "RVM-SEED-004", title: "[SEED] Civil Service Modernization Plan", ministry: "Ministry of Home Affairs", serviceType: "missive" as const, subtype: null, status: "scheduled" as const, urgency: "regular" as const },
  { number: "RVM-SEED-005", title: "[SEED] National Energy Transition Framework", ministry: "Ministry of Natural Resources", serviceType: "proposal" as const, subtype: "OPA" as const, status: "decided" as const, urgency: "special" as const },
  { number: "RVM-SEED-006", title: "[SEED] Agricultural Export Regulation Review", ministry: "Ministry of Agriculture", serviceType: "missive" as const, subtype: null, status: "archived" as const, urgency: "regular" as const },
];

const SEED_MEETINGS = [
  { title: "[SEED] RVM Meeting – Economic Policy Review", date: "2026-01-15", status: "closed" as const, type: "regular" as const, location: "Cabinet Room A" },
  { title: "[SEED] RVM Meeting – Infrastructure Projects", date: "2026-02-05", status: "closed" as const, type: "regular" as const, location: "Cabinet Room A" },
  { title: "[SEED] RVM Meeting – Public Administration Reform", date: "2026-02-26", status: "closed" as const, type: "urgent" as const, location: "Cabinet Room B" },
  { title: "[SEED] RVM Meeting – Budget Alignment", date: "2026-04-10", status: "published" as const, type: "regular" as const, location: "Cabinet Room A" },
  { title: "[SEED] RVM Meeting – Regional Development", date: "2026-05-01", status: "draft" as const, type: "special" as const, location: "Conference Hall" },
];

// Agenda items per meeting (index matches SEED_MEETINGS)
const SEED_AGENDA_ITEMS: Array<Array<{ title: string; dossierIdx: number }>> = [
  // Meeting 0 (Economic Policy Review — closed) — 5 items
  [
    { title: "Review national infrastructure funding proposal", dossierIdx: 1 },
    { title: "Evaluation of district housing allocation program", dossierIdx: 0 },
    { title: "Audit of procurement procedures", dossierIdx: 5 },
    { title: "Economic recovery stimulus package assessment", dossierIdx: 4 },
    { title: "Foreign trade agreement compliance review", dossierIdx: 2 },
  ],
  // Meeting 1 (Infrastructure Projects — closed) — 5 items
  [
    { title: "Transport corridor Phase II funding approval", dossierIdx: 1 },
    { title: "Bridge and waterway maintenance budget", dossierIdx: 1 },
    { title: "Public housing infrastructure assessment", dossierIdx: 0 },
    { title: "Digital infrastructure rollout status", dossierIdx: 2 },
    { title: "Energy grid modernization proposal", dossierIdx: 4 },
  ],
  // Meeting 2 (Public Administration Reform — closed) — 4 items
  [
    { title: "Civil service digitalization roadmap", dossierIdx: 2 },
    { title: "Public sector salary harmonization", dossierIdx: 3 },
    { title: "E-government portal launch timeline", dossierIdx: 2 },
    { title: "Administrative decentralization framework", dossierIdx: 3 },
  ],
  // Meeting 3 (Budget Alignment — published) — 5 items
  [
    { title: "FY2027 budget allocation priorities", dossierIdx: 0 },
    { title: "Ministry spending cap adjustments", dossierIdx: 3 },
    { title: "Revenue projection methodology update", dossierIdx: 4 },
    { title: "Capital investment pipeline review", dossierIdx: 1 },
    { title: "Social safety net funding assessment", dossierIdx: 0 },
  ],
  // Meeting 4 (Regional Development — draft) — 5 items
  [
    { title: "District development fund distribution", dossierIdx: 0 },
    { title: "Rural infrastructure gap analysis", dossierIdx: 1 },
    { title: "Agricultural sector support framework", dossierIdx: 5 },
    { title: "Regional health facility expansion", dossierIdx: 3 },
  ],
];

// Decisions for presented items in closed meetings
// Format: [meetingIdx, agendaItemIdx, status, text]
const SEED_DECISIONS: Array<{
  meetingIdx: number;
  agendaIdx: number;
  status: "approved" | "rejected" | "deferred" | "pending";
  text: string;
  isFinal: boolean;
}> = [
  { meetingIdx: 0, agendaIdx: 0, status: "approved", text: "Approve infrastructure budget allocation for Phase II project.", isFinal: true },
  { meetingIdx: 0, agendaIdx: 1, status: "approved", text: "Approve housing subsidy program extension for fiscal year 2026-2027.", isFinal: true },
  { meetingIdx: 0, agendaIdx: 2, status: "deferred", text: "Defer procurement audit review to next quarterly meeting.", isFinal: false },
  { meetingIdx: 0, agendaIdx: 3, status: "approved", text: "Approve economic recovery stimulus package of SRD 500M.", isFinal: true },
  { meetingIdx: 1, agendaIdx: 0, status: "approved", text: "Approve Phase II transport corridor funding of SRD 180M.", isFinal: true },
  { meetingIdx: 1, agendaIdx: 1, status: "rejected", text: "Reject bridge maintenance budget increase; refer to supplementary budget process.", isFinal: true },
  { meetingIdx: 1, agendaIdx: 2, status: "approved", text: "Approve public housing infrastructure assessment framework.", isFinal: true },
  { meetingIdx: 1, agendaIdx: 3, status: "deferred", text: "Defer digital infrastructure rollout pending cost analysis.", isFinal: false },
  { meetingIdx: 1, agendaIdx: 4, status: "approved", text: "Approve energy grid modernization proposal Phase I.", isFinal: true },
  { meetingIdx: 2, agendaIdx: 0, status: "approved", text: "Approve civil service digitalization roadmap with 18-month timeline.", isFinal: true },
  { meetingIdx: 2, agendaIdx: 1, status: "rejected", text: "Reject salary harmonization proposal; insufficient fiscal analysis.", isFinal: true },
  { meetingIdx: 2, agendaIdx: 2, status: "approved", text: "Approve e-government portal launch for Q3 2026.", isFinal: true },
];

const SEED_TASKS: Array<{
  title: string;
  description: string;
  dossierIdx: number;
  roleCode: string;
  assignedUserIdx: number;
  taskType: string;
  priority: "normal" | "high" | "urgent";
  status: "todo" | "in_progress" | "done";
}> = [
  { title: "Prepare implementation roadmap for approved infrastructure funding", description: "Draft detailed implementation roadmap for Phase II transport corridor project.", dossierIdx: 1, roleCode: "admin_dossier", assignedUserIdx: 2, taskType: "dossier_management", priority: "high", status: "in_progress" },
  { title: "Draft housing subsidy distribution plan", description: "Create distribution framework for approved housing subsidy program.", dossierIdx: 0, roleCode: "admin_dossier", assignedUserIdx: 2, taskType: "dossier_management", priority: "normal", status: "todo" },
  { title: "Compile economic stimulus disbursement schedule", description: "Prepare detailed schedule for SRD 500M stimulus disbursement.", dossierIdx: 4, roleCode: "secretary_rvm", assignedUserIdx: 1, taskType: "reporting", priority: "urgent", status: "in_progress" },
  { title: "Prepare energy grid modernization contracts", description: "Draft contract templates for Phase I grid modernization.", dossierIdx: 4, roleCode: "admin_dossier", assignedUserIdx: 2, taskType: "dossier_management", priority: "high", status: "todo" },
  { title: "Schedule e-government portal launch briefing", description: "Coordinate briefing session for Q3 2026 portal launch.", dossierIdx: 2, roleCode: "admin_agenda", assignedUserIdx: 3, taskType: "agenda_prep", priority: "normal", status: "done" },
  { title: "Digitalization roadmap progress review", description: "Review 18-month digitalization timeline progress and milestones.", dossierIdx: 2, roleCode: "secretary_rvm", assignedUserIdx: 1, taskType: "review", priority: "normal", status: "todo" },
  { title: "Prepare decision list for Economic Policy meeting", description: "Compile and format decision list from January 15 meeting.", dossierIdx: 4, roleCode: "admin_reporting", assignedUserIdx: 1, taskType: "reporting", priority: "normal", status: "done" },
  { title: "Follow up on deferred procurement audit", description: "Prepare updated materials for deferred procurement audit review.", dossierIdx: 5, roleCode: "admin_dossier", assignedUserIdx: 2, taskType: "dossier_management", priority: "normal", status: "todo" },
  { title: "Distribute approved housing program decision", description: "Distribute formal decision notification to relevant ministries.", dossierIdx: 0, roleCode: "secretary_rvm", assignedUserIdx: 1, taskType: "distribution", priority: "high", status: "in_progress" },
  { title: "Archive agricultural regulation review dossier", description: "Complete archival procedures for concluded agricultural review.", dossierIdx: 5, roleCode: "admin_dossier", assignedUserIdx: 2, taskType: "other", priority: "normal", status: "done" },
];

// ── Main Handler ───────────────────────────────────────────────────────

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const url = new URL(req.url);
    const force = url.searchParams.get("force") === "true";

    // ── Idempotency check ──
    const { count } = await supabase
      .from("rvm_dossier")
      .select("*", { count: "exact", head: true })
      .like("dossier_number", "RVM-SEED-%");

    if ((count ?? 0) > 0 && !force) {
      return new Response(
        JSON.stringify({ status: "already_seeded", message: "Seed data already exists. Use ?force=true to re-seed." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── Force cleanup (reverse dependency order) ──
    if ((count ?? 0) > 0 && force) {
      // Get seed dossier IDs
      const { data: seedDossiers } = await supabase
        .from("rvm_dossier")
        .select("id")
        .like("dossier_number", "RVM-SEED-%");

      const seedDossierIds = (seedDossiers ?? []).map((d) => d.id);

      if (seedDossierIds.length > 0) {
        // Get agenda items for seed dossiers
        const { data: seedAgendaItems } = await supabase
          .from("rvm_agenda_item")
          .select("id")
          .in("dossier_id", seedDossierIds);
        const seedAgendaItemIds = (seedAgendaItems ?? []).map((a) => a.id);

        // Delete decisions linked to seed agenda items
        if (seedAgendaItemIds.length > 0) {
          await supabase.from("rvm_decision").delete().in("agenda_item_id", seedAgendaItemIds);
        }

        // Delete tasks linked to seed dossiers
        await supabase.from("rvm_task").delete().in("dossier_id", seedDossierIds);

        // Delete documents linked to seed dossiers
        await supabase.from("rvm_document").delete().in("dossier_id", seedDossierIds);

        // Delete agenda items linked to seed dossiers
        await supabase.from("rvm_agenda_item").delete().in("dossier_id", seedDossierIds);

        // Get meeting IDs that had seed agenda items (meetings created by seed)
        const { data: seedMeetings } = await supabase
          .from("rvm_meeting")
          .select("id")
          .like("location", "%[SEED]%");
        const seedMeetingIds = (seedMeetings ?? []).map((m) => m.id);

        // Delete remaining agenda items on seed meetings
        if (seedMeetingIds.length > 0) {
          await supabase.from("rvm_agenda_item").delete().in("meeting_id", seedMeetingIds);
          await supabase.from("rvm_meeting").delete().in("id", seedMeetingIds);
        }

        // Delete seed dossiers
        await supabase.from("rvm_dossier").delete().in("id", seedDossierIds);
      }

      // Delete seed users (app data only; auth users persist)
      const seedEmails = SEED_USERS.map((u) => u.email);
      const { data: seedAppUsers } = await supabase
        .from("app_user")
        .select("id")
        .in("email", seedEmails);
      const seedAppUserIds = (seedAppUsers ?? []).map((u) => u.id);

      if (seedAppUserIds.length > 0) {
        await supabase.from("user_role").delete().in("user_id", seedAppUserIds);
        await supabase.from("app_user").delete().in("id", seedAppUserIds);
      }
    }

    // ── 1. Create auth users (idempotent) ──
    const userAuthIds: string[] = [];
    for (const seedUser of SEED_USERS) {
      // Check if auth user already exists
      const { data: existingUsers } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 1,
      });

      let existingUser = null;
      if (existingUsers?.users) {
        existingUser = existingUsers.users.find((u) => u.email === seedUser.email);
      }

      // If not found in first page, search more broadly
      if (!existingUser) {
        let page = 2;
        let hasMore = (existingUsers?.users?.length ?? 0) > 0;
        while (hasMore && !existingUser) {
          const { data: moreUsers } = await supabase.auth.admin.listUsers({ page, perPage: 50 });
          if (moreUsers?.users) {
            existingUser = moreUsers.users.find((u) => u.email === seedUser.email);
            hasMore = moreUsers.users.length === 50;
          } else {
            hasMore = false;
          }
          page++;
        }
      }

      if (existingUser) {
        userAuthIds.push(existingUser.id);
      } else {
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
          email: seedUser.email,
          password: SEED_PASSWORD,
          email_confirm: true,
        });
        if (createError) throw new Error(`Failed to create user ${seedUser.email}: ${createError.message}`);
        userAuthIds.push(newUser.user.id);
      }
    }

    // ── 2. Create app_user records ──
    const appUserIds: string[] = [];
    for (let i = 0; i < SEED_USERS.length; i++) {
      // Check if app_user already exists for this auth_id
      const { data: existingAppUser } = await supabase
        .from("app_user")
        .select("id")
        .eq("auth_id", userAuthIds[i])
        .maybeSingle();

      if (existingAppUser) {
        appUserIds.push(existingAppUser.id);
      } else {
        const { data: newAppUser, error } = await supabase
          .from("app_user")
          .insert({
            auth_id: userAuthIds[i],
            email: SEED_USERS[i].email,
            full_name: SEED_USERS[i].fullName,
            is_active: true,
          })
          .select("id")
          .single();
        if (error) throw new Error(`Failed to create app_user ${SEED_USERS[i].email}: ${error.message}`);
        appUserIds.push(newAppUser.id);
      }
    }

    // ── 3. Assign roles ──
    for (let i = 0; i < SEED_USERS.length; i++) {
      const { data: existingRole } = await supabase
        .from("user_role")
        .select("user_id")
        .eq("user_id", appUserIds[i])
        .eq("role_code", SEED_USERS[i].roleCode)
        .maybeSingle();

      if (!existingRole) {
        const { error } = await supabase.from("user_role").insert({
          user_id: appUserIds[i],
          role_code: SEED_USERS[i].roleCode,
        });
        if (error) throw new Error(`Failed to assign role ${SEED_USERS[i].roleCode}: ${error.message}`);
      }
    }

    // ── 4. Create dossiers ──
    const dossierIds: string[] = [];
    const secretaryAppUserId = appUserIds[1]; // secretary

    for (const dossier of SEED_DOSSIERS) {
      const { data, error } = await supabase
        .from("rvm_dossier")
        .insert({
          dossier_number: dossier.number,
          title: dossier.title,
          sender_ministry: dossier.ministry,
          service_type: dossier.serviceType,
          proposal_subtype: dossier.subtype,
          status: dossier.status,
          urgency: dossier.urgency,
          summary: `Seed data — ${dossier.title.replace("[SEED] ", "")}`,
          created_by: secretaryAppUserId,
          confidentiality_level: "standard_confidential",
        })
        .select("id")
        .single();
      if (error) throw new Error(`Failed to create dossier ${dossier.number}: ${error.message}`);
      dossierIds.push(data.id);
    }

    // ── 5. Create meetings ──
    const meetingIds: string[] = [];
    const chairAppUserId = appUserIds[0]; // chair

    for (const meeting of SEED_MEETINGS) {
      const { data, error } = await supabase
        .from("rvm_meeting")
        .insert({
          meeting_date: meeting.date,
          meeting_type: meeting.type,
          status: meeting.status,
          location: `${meeting.location} [SEED]`,
          created_by: secretaryAppUserId,
        })
        .select("id")
        .single();
      if (error) throw new Error(`Failed to create meeting ${meeting.title}: ${error.message}`);
      meetingIds.push(data.id);
    }

    // ── 6. Create agenda items ──
    const agendaItemIds: string[][] = []; // [meetingIdx][agendaIdx]
    let totalAgendaItems = 0;

    for (let mi = 0; mi < SEED_AGENDA_ITEMS.length; mi++) {
      const meetingAgendaIds: string[] = [];
      const items = SEED_AGENDA_ITEMS[mi];
      const isClosed = SEED_MEETINGS[mi].status === "closed";

      for (let ai = 0; ai < items.length; ai++) {
        const { data, error } = await supabase
          .from("rvm_agenda_item")
          .insert({
            meeting_id: meetingIds[mi],
            dossier_id: dossierIds[items[ai].dossierIdx],
            agenda_number: ai + 1,
            title_override: items[ai].title,
            status: isClosed ? "presented" : "scheduled",
          })
          .select("id")
          .single();
        if (error) throw new Error(`Failed to create agenda item: ${error.message}`);
        meetingAgendaIds.push(data.id);
        totalAgendaItems++;
      }
      agendaItemIds.push(meetingAgendaIds);
    }

    // ── 7. Create decisions ──
    let totalDecisions = 0;

    for (const dec of SEED_DECISIONS) {
      const agendaItemId = agendaItemIds[dec.meetingIdx][dec.agendaIdx];
      const isApproved = dec.status === "approved";

      const { error } = await supabase.from("rvm_decision").insert({
        agenda_item_id: agendaItemId,
        decision_text: dec.text,
        decision_status: dec.status,
        is_final: dec.isFinal,
        chair_approved_by: isApproved && dec.isFinal ? chairAppUserId : null,
        chair_approved_at: isApproved && dec.isFinal ? new Date().toISOString() : null,
      });
      if (error) throw new Error(`Failed to create decision: ${error.message}`);
      totalDecisions++;
    }

    // ── 8. Create tasks ──
    let totalTasks = 0;

    for (const task of SEED_TASKS) {
      const assignedUserId = appUserIds[task.assignedUserIdx];
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 14 + totalTasks * 7);

      const insertData: Record<string, unknown> = {
        title: task.title,
        description: task.description,
        dossier_id: dossierIds[task.dossierIdx],
        assigned_role_code: task.roleCode,
        assigned_user_id: assignedUserId,
        task_type: task.taskType,
        priority: task.priority,
        status: task.status,
        due_at: dueDate.toISOString(),
        created_by: secretaryAppUserId,
      };

      // Set timestamps for non-todo statuses
      if (task.status === "in_progress" || task.status === "done") {
        insertData.started_at = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      }
      if (task.status === "done") {
        insertData.completed_at = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString();
      }

      const { error } = await supabase.from("rvm_task").insert(insertData);
      if (error) throw new Error(`Failed to create task "${task.title}": ${error.message}`);
      totalTasks++;
    }

    // ── Summary ──
    const summary = {
      status: "seeded",
      counts: {
        auth_users: SEED_USERS.length,
        app_users: SEED_USERS.length,
        user_roles: SEED_USERS.length,
        dossiers: SEED_DOSSIERS.length,
        meetings: SEED_MEETINGS.length,
        agenda_items: totalAgendaItems,
        decisions: totalDecisions,
        tasks: totalTasks,
      },
      credentials: {
        password: SEED_PASSWORD,
        users: SEED_USERS.map((u) => ({ email: u.email, role: u.roleCode })),
      },
    };

    return new Response(JSON.stringify(summary, null, 2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ status: "error", message: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
