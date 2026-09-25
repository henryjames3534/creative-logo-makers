/** Local CRM store for /admin — advanced pipeline, leads, contacts, deals, tasks */

export type LeadStatus =
  | "new"
  | "contacted"
  | "qualified"
  | "proposal"
  | "won"
  | "lost";

export type DealStage =
  | "lead"
  | "qualified"
  | "brief"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export type TaskStatus = "todo" | "doing" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type ActivityType =
  | "note"
  | "call"
  | "email"
  | "meeting"
  | "status"
  | "deal"
  | "task"
  | "revision";

export type CrmOwner = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sales" | "success" | "ops";
};

export type CrmCompany = {
  id: string;
  name: string;
  industry: string;
  website?: string;
  size: string;
  country: string;
  ownerId: string;
  createdAt: string;
  notes?: string;
};

export type CrmContact = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  companyId?: string;
  ownerId: string;
  tags: string[];
  createdAt: string;
  lastTouchAt: string;
};

export type CrmLead = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  source: string;
  status: LeadStatus;
  score: number;
  interest: string;
  valueEstimate: number;
  ownerId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  contactId?: string;
};

export type CrmDeal = {
  id: string;
  title: string;
  stage: DealStage;
  value: number;
  currency: string;
  probability: number;
  contactId?: string;
  companyId?: string;
  leadId?: string;
  ownerId: string;
  category?: string;
  packageName?: string;
  closeDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
};

export type CrmTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueAt: string;
  ownerId: string;
  /** Primary link — each project has its own tasks */
  projectId?: string;
  /** Assigned marketplace designer */
  designerId?: string;
  designerName?: string;
  relatedType?: "lead" | "deal" | "contact" | "order" | "project";
  relatedId?: string;
  createdAt: string;
  notes?: string;
};

export type ProjectRevisionStatus =
  | "pending"
  | "in_progress"
  | "delivered"
  | "closed"
  | "rejected";

export type CrmProjectRevision = {
  id: string;
  round: number;
  title: string;
  note: string;
  status: ProjectRevisionStatus;
  requestedBy: "customer" | "admin";
  customerEmail?: string;
  adminReply?: string;
  createdAt: string;
  updatedAt: string;
};

/** Thread between designer ↔ client (and admin) on a CRM project */
export type CrmProjectMessage = {
  id: string;
  kind: "remark" | "request" | "reply";
  from: "designer" | "customer" | "admin";
  author: string;
  designerId?: string;
  body: string;
  createdAt: string;
  /** When kind=request: open until client replies / designer closes */
  status?: "open" | "fulfilled" | "closed";
};

export type CrmOrder = {
  id: string;
  orderId: string;
  title?: string;
  customerName: string;
  customerEmail: string;
  categoryName: string;
  packageName: string;
  amount: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
  updatedAt: string;
  designerCount: number;
  revisionLimit: number;
  revisionsUsed: number;
  revisions: CrmProjectRevision[];
  /** Designer remarks + client requests */
  messages?: CrmProjectMessage[];
  serviceId?: string;
  /** Marketplace designers assigned to this project */
  assignedDesignerIds: string[];
};

export type CrmActivity = {
  id: string;
  type: ActivityType;
  title: string;
  body: string;
  createdAt: string;
  ownerId: string;
  relatedType?: "lead" | "deal" | "contact" | "company" | "order" | "project";
  relatedId?: string;
};

export type CrmDesignerNote = {
  designerId: string;
  status: "active" | "vip" | "paused" | "flagged";
  notes: string;
  tags: string[];
  ownerId: string;
  updatedAt: string;
};

export type VisitorSource =
  | "google_onetap"
  | "google_button"
  | "login_form"
  | "signup_form"
  | "remembered"
  | "manual"
  | "page_visit"
  | "portal";

export type CrmGeo = {
  ip?: string;
  country?: string;
  countryCode?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isp?: string;
  fetchedAt?: string;
};

export type CrmPageView = {
  id: string;
  path: string;
  enteredAt: string;
  leftAt?: string;
  durationMs: number;
  sessionId: string;
};

export type CrmVisitSession = {
  id: string;
  startedAt: string;
  endedAt?: string;
  durationMs: number;
  pageCount: number;
};

export type CrmVisitor = {
  id: string;
  /** Stable anonymous browser id */
  visitorKey: string;
  email?: string;
  name?: string;
  picture?: string;
  source: VisitorSource;
  signedIn: boolean;
  firstSeenAt: string;
  lastSeenAt: string;
  path?: string;
  hits: number;
  visitCount: number;
  totalDurationMs: number;
  geo?: CrmGeo;
  pageViews: CrmPageView[];
  sessions: CrmVisitSession[];
  userAgent?: string;
  language?: string;
};

export type InboxKind = "revision" | "message" | "winner" | "like";

export type CrmInboxItem = {
  id: string;
  kind: InboxKind;
  status: "open" | "in_progress" | "resolved";
  customerEmail: string;
  customerName: string;
  serviceId: string;
  serviceTitle: string;
  body: string;
  createdAt: string;
  updatedAt: string;
  adminReply?: string;
  relatedRevisionId?: string;
};

export type ReviewStatus = "pending" | "approved" | "rejected";

/** Customer review after project done — listed on site only once admin approves */
export type CrmReview = {
  id: string;
  projectId?: string;
  orderId?: string;
  serviceId?: string;
  designerId: string;
  designerName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  body: string;
  categoryName?: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
  adminNote?: string;
};

export type CrmState = {
  version: 1;
  owners: CrmOwner[];
  companies: CrmCompany[];
  contacts: CrmContact[];
  leads: CrmLead[];
  deals: CrmDeal[];
  tasks: CrmTask[];
  activities: CrmActivity[];
  orders: CrmOrder[];
  designerNotes: CrmDesignerNote[];
  visitors: CrmVisitor[];
  inbox: CrmInboxItem[];
  reviews: CrmReview[];
};

const CRM_KEY = "clm_crm_v1";
const CRM_UPDATED_KEY = "clm_crm_updated_at";
const ADMIN_SESSION_KEY = "clm_admin_session_v1";
export const CRM_HYDRATED_EVENT = "clm_crm_hydrated";

export const DEAL_STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: "lead", label: "New lead", color: "#6b6a68" },
  { id: "qualified", label: "Qualified", color: "#2486cb" },
  { id: "brief", label: "Briefing", color: "#834692" },
  { id: "proposal", label: "Proposal", color: "#a5823d" },
  { id: "negotiation", label: "Negotiation", color: "#fe5f50" },
  { id: "won", label: "Won", color: "#00a581" },
  { id: "lost", label: "Lost", color: "#9ca3af" },
];

export const LEAD_STATUSES: { id: LeadStatus; label: string }[] = [
  { id: "new", label: "New" },
  { id: "contacted", label: "Contacted" },
  { id: "qualified", label: "Qualified" },
  { id: "proposal", label: "Proposal" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function isoDays(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString();
}

function seed(): CrmState {
  const owners: CrmOwner[] = [
    {
      id: "own_admin",
      name: "Admin",
      email: "admin@creativelogomakers.com",
      role: "admin",
    },
    {
      id: "own_sara",
      name: "Sara Khan",
      email: "sara@creativelogomakers.com",
      role: "sales",
    },
    {
      id: "own_leo",
      name: "Leo Martins",
      email: "leo@creativelogomakers.com",
      role: "success",
    },
    {
      id: "own_maya",
      name: "Maya Chen",
      email: "maya@creativelogomakers.com",
      role: "ops",
    },
  ];

  const companies: CrmCompany[] = [
    {
      id: "co_1",
      name: "Northwind Foods",
      industry: "Food & drink",
      website: "northwind.example",
      size: "51–200",
      country: "United States",
      ownerId: "own_sara",
      createdAt: isoDays(-40),
    },
    {
      id: "co_2",
      name: "Pulse Health",
      industry: "Medical",
      website: "pulsehealth.example",
      size: "11–50",
      country: "United Kingdom",
      ownerId: "own_leo",
      createdAt: isoDays(-22),
    },
    {
      id: "co_3",
      name: "Orbit Apps",
      industry: "Technology",
      size: "1–10",
      country: "Canada",
      ownerId: "own_sara",
      createdAt: isoDays(-12),
    },
    {
      id: "co_4",
      name: "Vista Retail Co",
      industry: "Retail",
      size: "201–500",
      country: "Australia",
      ownerId: "own_maya",
      createdAt: isoDays(-8),
    },
  ];

  const contacts: CrmContact[] = [
    {
      id: "ct_1",
      name: "Jordan Blake",
      email: "jordan@northwind.example",
      phone: "+1 415 555 0142",
      title: "Brand Manager",
      companyId: "co_1",
      ownerId: "own_sara",
      tags: ["decision-maker", "packaging"],
      createdAt: isoDays(-38),
      lastTouchAt: isoDays(-1),
    },
    {
      id: "ct_2",
      name: "Priya Nair",
      email: "priya@pulsehealth.example",
      phone: "+44 20 7946 0958",
      title: "CMO",
      companyId: "co_2",
      ownerId: "own_leo",
      tags: ["enterprise", "identity"],
      createdAt: isoDays(-20),
      lastTouchAt: isoDays(-3),
    },
    {
      id: "ct_3",
      name: "Sam Ortiz",
      email: "sam@orbitapps.example",
      title: "Founder",
      companyId: "co_3",
      ownerId: "own_sara",
      tags: ["startup", "web"],
      createdAt: isoDays(-10),
      lastTouchAt: isoDays(-2),
    },
    {
      id: "ct_4",
      name: "Elena Rossi",
      email: "elena@vistaretail.example",
      title: "Creative Director",
      companyId: "co_4",
      ownerId: "own_maya",
      tags: ["retail", "merch"],
      createdAt: isoDays(-7),
      lastTouchAt: isoDays(-0),
    },
    {
      id: "ct_5",
      name: "Abdul Wahib",
      email: "abdulwahibshera@gmail.com",
      title: "Owner",
      ownerId: "own_admin",
      tags: ["self-serve", "hot"],
      createdAt: isoDays(-2),
      lastTouchAt: isoDays(-0),
    },
  ];

  const leads: CrmLead[] = [
    {
      id: "ld_1",
      name: "Jordan Blake",
      email: "jordan@northwind.example",
      phone: "+1 415 555 0142",
      company: "Northwind Foods",
      source: "Website — packaging",
      status: "proposal",
      score: 86,
      interest: "Product packaging",
      valueEstimate: 1699,
      ownerId: "own_sara",
      notes: "Needs pouch + label system for Q4 launch.",
      createdAt: isoDays(-14),
      updatedAt: isoDays(-1),
      contactId: "ct_1",
    },
    {
      id: "ld_2",
      name: "Sam Ortiz",
      email: "sam@orbitapps.example",
      company: "Orbit Apps",
      source: "Google ads",
      status: "qualified",
      score: 72,
      interest: "Landing page + logo",
      valueEstimate: 1299,
      ownerId: "own_sara",
      notes: "Seed round — wants contest + 1-to-1 hybrid.",
      createdAt: isoDays(-9),
      updatedAt: isoDays(-2),
      contactId: "ct_3",
    },
    {
      id: "ld_3",
      name: "Priya Nair",
      email: "priya@pulsehealth.example",
      company: "Pulse Health",
      source: "Studio inquiry",
      status: "contacted",
      score: 91,
      interest: "Full brand identity",
      valueEstimate: 8499,
      ownerId: "own_leo",
      notes: "Enterprise — compliance review pending.",
      createdAt: isoDays(-18),
      updatedAt: isoDays(-3),
      contactId: "ct_2",
    },
    {
      id: "ld_4",
      name: "Chris Young",
      email: "chris@ indiecafe.example",
      company: "Indie Cafe",
      source: "Referral",
      status: "new",
      score: 54,
      interest: "Logo design",
      valueEstimate: 399,
      ownerId: "own_maya",
      notes: "Small budget, fast turnaround.",
      createdAt: isoDays(-1),
      updatedAt: isoDays(-1),
    },
    {
      id: "ld_5",
      name: "Elena Rossi",
      email: "elena@vistaretail.example",
      company: "Vista Retail Co",
      source: "Outbound",
      status: "won",
      score: 88,
      interest: "T-shirt + merch pack",
      valueEstimate: 999,
      ownerId: "own_maya",
      notes: "Closed — seasonal merch drop.",
      createdAt: isoDays(-30),
      updatedAt: isoDays(-5),
      contactId: "ct_4",
    },
    {
      id: "ld_6",
      name: "Abdul Wahib",
      email: "abdulwahibshera@gmail.com",
      source: "Direct / Chrome",
      status: "new",
      score: 68,
      interest: "Logo + brand guide",
      valueEstimate: 799,
      ownerId: "own_admin",
      notes: "Active on local demo site.",
      createdAt: isoDays(-0),
      updatedAt: isoDays(-0),
      contactId: "ct_5",
    },
  ];

  const deals: CrmDeal[] = [
    {
      id: "dl_1",
      title: "Northwind packaging system",
      stage: "proposal",
      value: 1699,
      currency: "USD",
      probability: 55,
      contactId: "ct_1",
      companyId: "co_1",
      leadId: "ld_1",
      ownerId: "own_sara",
      category: "product-packaging-design",
      packageName: "Platinum",
      closeDate: isoDays(12),
      createdAt: isoDays(-12),
      updatedAt: isoDays(-1),
    },
    {
      id: "dl_2",
      title: "Orbit launch kit",
      stage: "brief",
      value: 1299,
      currency: "USD",
      probability: 40,
      contactId: "ct_3",
      companyId: "co_3",
      leadId: "ld_2",
      ownerId: "own_sara",
      category: "landing-page-design",
      packageName: "Gold",
      closeDate: isoDays(21),
      createdAt: isoDays(-8),
      updatedAt: isoDays(-2),
    },
    {
      id: "dl_3",
      title: "Pulse Health Studio rebrand",
      stage: "qualified",
      value: 8499,
      currency: "USD",
      probability: 35,
      contactId: "ct_2",
      companyId: "co_2",
      leadId: "ld_3",
      ownerId: "own_leo",
      category: "full-service-branding",
      packageName: "Studio",
      closeDate: isoDays(45),
      createdAt: isoDays(-16),
      updatedAt: isoDays(-3),
    },
    {
      id: "dl_4",
      title: "Indie Cafe logo contest",
      stage: "lead",
      value: 399,
      currency: "USD",
      probability: 20,
      leadId: "ld_4",
      ownerId: "own_maya",
      category: "logo-design",
      packageName: "Silver",
      closeDate: isoDays(18),
      createdAt: isoDays(-1),
      updatedAt: isoDays(-1),
    },
    {
      id: "dl_5",
      title: "Vista seasonal merch",
      stage: "won",
      value: 999,
      currency: "USD",
      probability: 100,
      contactId: "ct_4",
      companyId: "co_4",
      leadId: "ld_5",
      ownerId: "own_maya",
      category: "t-shirt-design",
      packageName: "Gold",
      closeDate: isoDays(-5),
      createdAt: isoDays(-28),
      updatedAt: isoDays(-5),
    },
    {
      id: "dl_6",
      title: "Abdul brand starter",
      stage: "negotiation",
      value: 799,
      currency: "USD",
      probability: 60,
      contactId: "ct_5",
      leadId: "ld_6",
      ownerId: "own_admin",
      category: "logo-brand-guide",
      packageName: "Gold",
      closeDate: isoDays(7),
      createdAt: isoDays(-0),
      updatedAt: isoDays(-0),
    },
  ];

  const tasks: CrmTask[] = [
    {
      id: "tk_1",
      title: "Send packaging moodboard to Jordan",
      status: "todo",
      priority: "high",
      dueAt: isoDays(1),
      ownerId: "own_sara",
      projectId: "or_2",
      relatedType: "project",
      relatedId: "or_2",
      createdAt: isoDays(-1),
    },
    {
      id: "tk_p1",
      title: "QC round-2 navy colorway (Vista tee)",
      status: "doing",
      priority: "high",
      dueAt: isoDays(0),
      ownerId: "own_maya",
      projectId: "or_1",
      relatedType: "project",
      relatedId: "or_1",
      createdAt: isoDays(-1),
      notes: "Linked to revision round 2",
    },
    {
      id: "tk_p2",
      title: "Upload print-ready PNG + mockups",
      status: "todo",
      priority: "medium",
      dueAt: isoDays(2),
      ownerId: "own_maya",
      projectId: "or_1",
      relatedType: "project",
      relatedId: "or_1",
      createdAt: isoDays(-0),
    },
    {
      id: "tk_p3",
      title: "Assign designers to Northwind pouch",
      status: "doing",
      priority: "high",
      dueAt: isoDays(1),
      ownerId: "own_leo",
      projectId: "or_2",
      relatedType: "project",
      relatedId: "or_2",
      createdAt: isoDays(-3),
    },
    {
      id: "tk_p4",
      title: "Confirm brief completeness — Orbit landing",
      status: "todo",
      priority: "medium",
      dueAt: isoDays(2),
      ownerId: "own_admin",
      projectId: "or_3",
      relatedType: "project",
      relatedId: "or_3",
      createdAt: isoDays(-1),
    },
    {
      id: "tk_2",
      title: "Schedule Studio discovery with Priya",
      status: "doing",
      priority: "high",
      dueAt: isoDays(2),
      ownerId: "own_leo",
      relatedType: "lead",
      relatedId: "ld_3",
      createdAt: isoDays(-2),
    },
    {
      id: "tk_3",
      title: "Follow up Indie Cafe quote",
      status: "todo",
      priority: "medium",
      dueAt: isoDays(3),
      ownerId: "own_maya",
      relatedType: "lead",
      relatedId: "ld_4",
      createdAt: isoDays(-0),
    },
    {
      id: "tk_5",
      title: "Confirm Abdul package selection",
      status: "todo",
      priority: "high",
      dueAt: isoDays(0),
      ownerId: "own_admin",
      relatedType: "deal",
      relatedId: "dl_6",
      createdAt: isoDays(-0),
    },
  ];

  const activities: CrmActivity[] = [
    {
      id: "ac_1",
      type: "call",
      title: "Discovery call — Northwind",
      body: "Discussed pouch SKUs, print constraints, and Platinum package.",
      createdAt: isoDays(-1),
      ownerId: "own_sara",
      relatedType: "deal",
      relatedId: "dl_1",
    },
    {
      id: "ac_2",
      type: "email",
      title: "Proposal sent — Pulse Health",
      body: "Studio quote + timeline shared. Waiting on legal.",
      createdAt: isoDays(-3),
      ownerId: "own_leo",
      relatedType: "lead",
      relatedId: "ld_3",
    },
    {
      id: "ac_3",
      type: "note",
      title: "Orbit prefers contest + 1-to-1",
      body: "Wants logo contest first, then landing page project.",
      createdAt: isoDays(-2),
      ownerId: "own_sara",
      relatedType: "deal",
      relatedId: "dl_2",
    },
    {
      id: "ac_4",
      type: "status",
      title: "Deal won — Vista merch",
      body: "Marked closed-won. Handoff to ops complete.",
      createdAt: isoDays(-5),
      ownerId: "own_maya",
      relatedType: "deal",
      relatedId: "dl_5",
    },
    {
      id: "ac_5",
      type: "meeting",
      title: "Admin sync",
      body: "Reviewed pipeline health and overdue tasks.",
      createdAt: isoDays(-0),
      ownerId: "own_admin",
    },
  ];

  const orders: CrmOrder[] = [
    {
      id: "or_1",
      orderId: "ORD-10482",
      title: "Vista Retail — Merch tee drop",
      customerName: "Elena Rossi",
      customerEmail: "elena@vistaretail.example",
      categoryName: "T-shirt design",
      packageName: "Gold",
      amount: 499,
      status: "revisions",
      paymentStatus: "paid",
      createdAt: isoDays(-20),
      updatedAt: isoDays(-2),
      designerCount: 18,
      revisionLimit: 3,
      revisionsUsed: 2,
      assignedDesignerIds: ["554690"],
      revisions: [
        {
          id: "prv_1a",
          round: 1,
          title: "Softener typography",
          note: "Make brand name bolder; move icon left.",
          status: "delivered",
          requestedBy: "customer",
          customerEmail: "elena@vistaretail.example",
          adminReply: "Updated files delivered in round 1.",
          createdAt: isoDays(-12),
          updatedAt: isoDays(-10),
        },
        {
          id: "prv_1b",
          round: 2,
          title: "Color tweak",
          note: "Switch coral accent to navy for print safety.",
          status: "in_progress",
          requestedBy: "customer",
          customerEmail: "elena@vistaretail.example",
          createdAt: isoDays(-2),
          updatedAt: isoDays(-2),
        },
      ],
    },
    {
      id: "or_2",
      orderId: "ORD-10501",
      title: "Northwind — Pouch packaging",
      customerName: "Jordan Blake",
      customerEmail: "jordan@northwind.example",
      categoryName: "Product packaging",
      packageName: "Platinum",
      amount: 1699,
      status: "designs_incoming",
      paymentStatus: "paid",
      createdAt: isoDays(-6),
      updatedAt: isoDays(-1),
      designerCount: 9,
      revisionLimit: 5,
      revisionsUsed: 1,
      assignedDesignerIds: ["1729434"],
      revisions: [
        {
          id: "prv_2a",
          round: 1,
          title: "Front panel hierarchy",
          note: "Increase product name size; keep flavor badge smaller.",
          status: "pending",
          requestedBy: "customer",
          customerEmail: "jordan@northwind.example",
          createdAt: isoDays(-1),
          updatedAt: isoDays(-1),
        },
      ],
    },
    {
      id: "or_3",
      orderId: "ORD-10518",
      title: "Orbit Apps — Landing page",
      customerName: "Sam Ortiz",
      customerEmail: "sam@orbitapps.example",
      categoryName: "Landing page",
      packageName: "Gold",
      amount: 899,
      status: "brief_submitted",
      paymentStatus: "pending",
      createdAt: isoDays(-2),
      updatedAt: isoDays(-2),
      designerCount: 0,
      revisionLimit: 3,
      revisionsUsed: 0,
      revisions: [],
      assignedDesignerIds: [],
    },
  ];

  const designerNotes: CrmDesignerNote[] = [
    {
      designerId: "554690",
      status: "vip",
      notes: "hadynoody — strong illustration, fast responses.",
      tags: ["illustration", "logo"],
      ownerId: "own_leo",
      updatedAt: isoDays(-4),
    },
    {
      designerId: "1729434",
      status: "active",
      notes: "KisaDesign — web/app specialist.",
      tags: ["web"],
      ownerId: "own_maya",
      updatedAt: isoDays(-10),
    },
  ];

  return {
    version: 1,
    owners,
    companies,
    contacts,
    leads,
    deals,
    tasks,
    activities,
    orders,
    designerNotes,
    visitors: [],
    inbox: [],
    reviews: [
      {
        id: "rv_seed_1",
        projectId: "or_1",
        orderId: "ORD-10482",
        designerId: "554690",
        designerName: "hadynoody",
        customerName: "Elena Rossi",
        customerEmail: "elena@vistaretail.example",
        rating: 5,
        body: "Fantastic merch direction — fast revisions and on-brand from the first round.",
        categoryName: "T-shirt design",
        status: "approved",
        createdAt: isoDays(-8),
        updatedAt: isoDays(-7),
        reviewedAt: isoDays(-7),
      },
    ],
  };
}

function readRaw(): CrmState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CRM_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CrmState;
  } catch {
    return null;
  }
}

function readCrmUpdatedAt(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(CRM_UPDATED_KEY);
  } catch {
    return null;
  }
}

export function loadCrm(): CrmState {
  const existing = readRaw();
  if (existing?.version === 1) {
    let dirty = false;
    if (!Array.isArray(existing.visitors)) {
      existing.visitors = [];
      dirty = true;
    }
    if (!Array.isArray(existing.inbox)) {
      existing.inbox = [];
      dirty = true;
    }
    if (!Array.isArray(existing.reviews)) {
      existing.reviews = [];
      dirty = true;
    }
    existing.visitors = existing.visitors.map(normalizeVisitor);
    existing.orders = (existing.orders || []).map((o) => {
      const n = normalizeOrder(o);
      if (
        n.revisionLimit !== o.revisionLimit ||
        !Array.isArray(o.revisions)
      ) {
        dirty = true;
      }
      return n;
    });
    if (dirty) saveCrm(existing);
    return existing;
  }
  const fresh = seed();
  saveCrm(fresh);
  return fresh;
}

function normalizeVisitor(v: CrmVisitor): CrmVisitor {
  return {
    ...v,
    visitorKey: v.visitorKey || v.id,
    hits: v.hits || 0,
    visitCount: v.visitCount || 1,
    totalDurationMs: v.totalDurationMs || 0,
    pageViews: Array.isArray(v.pageViews) ? v.pageViews : [],
    sessions: Array.isArray(v.sessions) ? v.sessions : [],
    email: v.email?.toLowerCase(),
  };
}

function normalizeOrder(o: CrmOrder): CrmOrder {
  const revisions = Array.isArray(o.revisions) ? o.revisions : [];
  const limit =
    typeof o.revisionLimit === "number" && o.revisionLimit > 0
      ? o.revisionLimit
      : o.packageName?.toLowerCase().includes("platinum")
        ? 5
        : 3;
  return {
    ...o,
    title: o.title || `${o.categoryName} — ${o.customerName}`,
    revisionLimit: limit,
    revisionsUsed: o.revisionsUsed ?? revisions.length,
    revisions,
    messages: Array.isArray(o.messages) ? o.messages : [],
    assignedDesignerIds: Array.isArray(o.assignedDesignerIds)
      ? o.assignedDesignerIds
      : [],
  };
}

export function saveCrm(state: CrmState) {
  if (typeof window === "undefined") return;
  const updatedAt = new Date().toISOString();
  localStorage.setItem(CRM_KEY, JSON.stringify(state));
  localStorage.setItem(CRM_UPDATED_KEY, updatedAt);
  // Lazy-import to avoid circular deps at module init
  void import("@/lib/db-sync").then(({ scheduleStorePush }) => {
    scheduleStorePush("crm", state);
  });
}

/** Pull CRM from Postgres (or push local if server empty / older). */
export async function hydrateCrmFromServer(): Promise<CrmState> {
  if (typeof window === "undefined") return seed();
  const { hydrateStoreKey } = await import("@/lib/db-sync");
  await hydrateStoreKey({
    key: "crm",
    localRaw: localStorage.getItem(CRM_KEY),
    localUpdatedAt: readCrmUpdatedAt(),
    writeLocal: (raw, updatedAt) => {
      localStorage.setItem(CRM_KEY, raw);
      localStorage.setItem(CRM_UPDATED_KEY, updatedAt);
    },
  });
  const state = loadCrm();
  emitCrm(CRM_HYDRATED_EVENT, state);
  return state;
}

export function onCrmHydrated(cb: (state: CrmState) => void) {
  if (typeof window === "undefined") return () => {};
  const handler = (e: Event) => {
    const detail = (e as CustomEvent<CrmState>).detail;
    if (detail) cb(detail);
  };
  window.addEventListener(CRM_HYDRATED_EVENT, handler);
  return () => window.removeEventListener(CRM_HYDRATED_EVENT, handler);
}

export function resetCrm() {
  const fresh = seed();
  saveCrm(fresh);
  return fresh;
}

export function getAdminSession(): { email: string; name: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(ADMIN_SESSION_KEY);
    return raw ? (JSON.parse(raw) as { email: string; name: string }) : null;
  } catch {
    return null;
  }
}

export function adminLogin(email: string, password: string) {
  const e = email.trim().toLowerCase();
  const ok =
    (e === "admin@creativelogomakers.com" && password === "admin123") ||
    (e === "sara@creativelogomakers.com" && password === "sara123");
  if (!ok) return { ok: false as const, error: "Invalid admin credentials." };
  const name = e.startsWith("sara") ? "Sara Khan" : "Admin";
  sessionStorage.setItem(
    ADMIN_SESSION_KEY,
    JSON.stringify({ email: e, name }),
  );
  return { ok: true as const };
}

export function adminLogout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export function updateDealStage(dealId: string, stage: DealStage) {
  const state = loadCrm();
  const deal = state.deals.find((d) => d.id === dealId);
  if (!deal) return state;
  deal.stage = stage;
  deal.probability =
    stage === "won"
      ? 100
      : stage === "lost"
        ? 0
        : Math.min(90, deal.probability + 5);
  deal.updatedAt = new Date().toISOString();
  state.activities.unshift({
    id: uid("ac"),
    type: "deal",
    title: `Deal moved to ${stage}`,
    body: `${deal.title} → ${stage}`,
    createdAt: new Date().toISOString(),
    ownerId: deal.ownerId,
    relatedType: "deal",
    relatedId: deal.id,
  });
  saveCrm(state);
  return state;
}

const VISITOR_EVENT = "clm_crm_visitor";
const INBOX_EVENT = "clm_crm_inbox";
const REVIEW_EVENT = "clm_crm_review";

function emitCrm(event: string, detail?: unknown) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(event, { detail }));
}

function findVisitor(
  state: CrmState,
  opts: { visitorKey?: string; email?: string },
) {
  if (opts.email) {
    const byEmail = state.visitors.find(
      (v) => v.email === opts.email!.toLowerCase(),
    );
    if (byEmail) return byEmail;
  }
  if (opts.visitorKey) {
    return state.visitors.find((v) => v.visitorKey === opts.visitorKey);
  }
  return undefined;
}

export function trackVisitor(input: {
  email?: string;
  visitorKey?: string;
  name?: string;
  picture?: string;
  source: VisitorSource;
  signedIn?: boolean;
  path?: string;
  createLead?: boolean;
  geo?: CrmGeo;
  userAgent?: string;
  language?: string;
}) {
  const email = input.email?.trim().toLowerCase();
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return loadCrm();
  if (!email && !input.visitorKey) return loadCrm();

  const state = loadCrm();
  if (!Array.isArray(state.visitors)) state.visitors = [];
  const now = new Date().toISOString();
  let existing = findVisitor(state, {
    email,
    visitorKey: input.visitorKey,
  });

  // Merge anon visitor into email visitor when email appears
  if (email && input.visitorKey) {
    const anon = state.visitors.find(
      (v) => v.visitorKey === input.visitorKey && !v.email,
    );
    const byEmail = state.visitors.find((v) => v.email === email);
    if (anon && byEmail && anon.id !== byEmail.id) {
      byEmail.pageViews = [...anon.pageViews, ...byEmail.pageViews]
        .sort((a, b) => +new Date(b.enteredAt) - +new Date(a.enteredAt))
        .slice(0, 200);
      byEmail.sessions = [...anon.sessions, ...byEmail.sessions].slice(0, 50);
      byEmail.totalDurationMs += anon.totalDurationMs;
      byEmail.visitCount += anon.visitCount;
      byEmail.hits += anon.hits;
      if (anon.geo && !byEmail.geo?.ip) byEmail.geo = anon.geo;
      state.visitors = state.visitors.filter((v) => v.id !== anon.id);
      existing = byEmail;
    } else if (anon && !byEmail) {
      anon.email = email;
      existing = anon;
    }
  }

  const name =
    input.name?.trim() ||
    existing?.name ||
    (email ? email.split("@")[0] : "Anonymous");

  if (existing) {
    existing.name = name;
    if (email) existing.email = email;
    if (input.visitorKey) existing.visitorKey = input.visitorKey;
    if (input.picture) existing.picture = input.picture;
    existing.source = input.source;
    existing.signedIn = existing.signedIn || Boolean(input.signedIn);
    existing.lastSeenAt = now;
    existing.hits += 1;
    if (input.path) existing.path = input.path;
    if (input.geo) existing.geo = { ...existing.geo, ...input.geo };
    if (input.userAgent) existing.userAgent = input.userAgent;
    if (input.language) existing.language = input.language;
  } else {
    state.visitors.unshift({
      id: uid("vis"),
      visitorKey: input.visitorKey || uid("vk"),
      email,
      name,
      picture: input.picture,
      source: input.source,
      signedIn: Boolean(input.signedIn),
      firstSeenAt: now,
      lastSeenAt: now,
      path: input.path,
      hits: 1,
      visitCount: 0,
      totalDurationMs: 0,
      geo: input.geo,
      pageViews: [],
      sessions: [],
      userAgent: input.userAgent,
      language: input.language,
    });
    state.activities.unshift({
      id: uid("ac"),
      type: "note",
      title: email ? "New visitor email captured" : "New anonymous visitor",
      body: `${email || input.visitorKey} via ${input.source.replace(/_/g, " ")}`,
      createdAt: now,
      ownerId: "own_admin",
      relatedType: "lead",
    });
  }

  if (email && input.createLead !== false) {
    const leadIdx = state.leads.findIndex((l) => l.email === email);
    if (leadIdx < 0) {
      state.leads.unshift({
        id: uid("ld"),
        name: name || email,
        email,
        source:
          input.source === "google_onetap" || input.source === "google_button"
            ? "Google"
            : input.source === "login_form"
              ? "Login form"
              : input.source === "signup_form"
                ? "Signup form"
                : "Visitor",
        status: "new",
        score: input.source.startsWith("google") ? 70 : 45,
        interest: "Site visit / login",
        valueEstimate: 299,
        ownerId: "own_admin",
        notes: `Auto-captured visitor (${input.source})`,
        createdAt: now,
        updatedAt: now,
      });
    } else {
      state.leads[leadIdx].updatedAt = now;
      if (name) state.leads[leadIdx].name = name;
    }
  }

  saveCrm(state);
  emitCrm(VISITOR_EVENT, { email, visitorKey: input.visitorKey });
  return state;
}

export function updateVisitorGeo(
  visitorKey: string,
  geo: CrmGeo,
  email?: string,
) {
  const state = loadCrm();
  const v = findVisitor(state, { visitorKey, email });
  if (!v) return state;
  v.geo = { ...v.geo, ...geo, fetchedAt: new Date().toISOString() };
  v.lastSeenAt = new Date().toISOString();
  saveCrm(state);
  emitCrm(VISITOR_EVENT);
  return state;
}

/** Pull remembered Google accounts into CRM visitors (fills email on guest rows) */
export function syncRememberedGoogleIntoVisitors(
  accounts: { email: string; name: string; picture?: string }[],
) {
  if (!accounts.length) return loadCrm();
  let state = loadCrm();
  const guests = state.visitors.filter((v) => !v.email);
  const norm = (s: string) =>
    s.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const acc of accounts) {
    const email = acc.email.trim().toLowerCase();
    if (!email) continue;
    const existing = state.visitors.find((v) => v.email === email);
    if (existing) {
      if (acc.name) existing.name = acc.name;
      if (acc.picture) existing.picture = acc.picture;
      existing.source =
        existing.source === "page_visit" ? "remembered" : existing.source;
      existing.lastSeenAt = new Date().toISOString();
      continue;
    }

    // Match guest by name (e.g. user typed "Henry James")
    const byName = guests.find(
      (g) =>
        g.name &&
        g.name !== "Anonymous" &&
        (norm(g.name) === norm(acc.name) ||
          norm(acc.name).includes(norm(g.name)) ||
          norm(g.name).includes(norm(acc.name))),
    );
    if (byName) {
      state = attachVisitorEmail({
        visitorId: byName.id,
        visitorKey: byName.visitorKey,
        email,
        name: acc.name,
      });
      continue;
    }

    // Attach to newest guest if only one Google account known
    if (accounts.length === 1 && guests[0]) {
      state = attachVisitorEmail({
        visitorId: guests[0].id,
        visitorKey: guests[0].visitorKey,
        email,
        name: acc.name,
      });
      continue;
    }

    state = trackVisitor({
      email,
      name: acc.name,
      picture: acc.picture,
      source: "remembered",
      signedIn: false,
      createLead: true,
    });
  }

  emitCrm(VISITOR_EVENT);
  return loadCrm();
}

/** Manually attach email shown on Google One Tap (type/paste → CRM) */
export function attachVisitorEmail(input: {
  visitorId?: string;
  visitorKey?: string;
  email: string;
  name?: string;
}) {
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return loadCrm();

  const state = loadCrm();
  let v =
    (input.visitorId && state.visitors.find((x) => x.id === input.visitorId)) ||
    (input.visitorKey &&
      state.visitors.find((x) => x.visitorKey === input.visitorKey)) ||
    state.visitors.find((x) => !x.email) ||
    state.visitors[0];

  const name =
    input.name?.trim() ||
    email.split("@")[0].replace(/[._]/g, " ") ||
    "Visitor";

  if (!v) {
    return trackVisitor({
      email,
      name,
      source: "manual",
      signedIn: false,
      createLead: true,
    });
  }

  // Merge if another row already has this email
  const byEmail = state.visitors.find((x) => x.email === email && x.id !== v!.id);
  if (byEmail) {
    byEmail.pageViews = [...(v.pageViews || []), ...(byEmail.pageViews || [])]
      .sort((a, b) => +new Date(b.enteredAt) - +new Date(a.enteredAt))
      .slice(0, 200);
    byEmail.sessions = [...(v.sessions || []), ...(byEmail.sessions || [])].slice(
      0,
      50,
    );
    byEmail.totalDurationMs += v.totalDurationMs || 0;
    byEmail.visitCount += v.visitCount || 0;
    byEmail.hits += v.hits || 0;
    if (v.geo && !byEmail.geo?.country) byEmail.geo = v.geo;
    byEmail.name = name;
    byEmail.source = "manual";
    byEmail.lastSeenAt = new Date().toISOString();
    state.visitors = state.visitors.filter((x) => x.id !== v!.id);
    v = byEmail;
  } else {
    v.email = email;
    v.name = name;
    v.source = "manual";
    v.lastSeenAt = new Date().toISOString();
  }

  const leadIdx = state.leads.findIndex((l) => l.email === email);
  if (leadIdx < 0) {
    const now = new Date().toISOString();
    state.leads.unshift({
      id: uid("ld"),
      name,
      email,
      source: "Google One Tap (manual)",
      status: "new",
      score: 75,
      interest: "Site visit",
      valueEstimate: 299,
      ownerId: "own_admin",
      notes: "Email typed from Google One Tap display",
      createdAt: now,
      updatedAt: now,
    });
  }

  saveCrm(state);
  emitCrm(VISITOR_EVENT);
  return state;
}

export function startVisitorSession(input: {
  visitorKey: string;
  email?: string;
  path: string;
  userAgent?: string;
  language?: string;
}) {
  const state = loadCrm();
  let v = findVisitor(state, {
    visitorKey: input.visitorKey,
    email: input.email,
  });
  const now = new Date().toISOString();
  if (!v) {
    trackVisitor({
      visitorKey: input.visitorKey,
      email: input.email,
      source: "page_visit",
      path: input.path,
      createLead: Boolean(input.email),
      userAgent: input.userAgent,
      language: input.language,
    });
    return loadCrm();
  }

  // Close open page view
  const openPv = v.pageViews.find((p) => !p.leftAt);
  if (openPv) {
    openPv.leftAt = now;
    openPv.durationMs = Math.max(
      0,
      +new Date(now) - +new Date(openPv.enteredAt),
    );
    v.totalDurationMs += openPv.durationMs;
  }

  const lastSession = v.sessions[0];
  const gapMs = lastSession
    ? +new Date(now) - +new Date(lastSession.endedAt || lastSession.startedAt)
    : Infinity;
  const newSession = !lastSession || gapMs > 30 * 60 * 1000;

  let sessionId: string;
  if (newSession) {
    if (lastSession && !lastSession.endedAt) {
      lastSession.endedAt = now;
      lastSession.durationMs = Math.max(
        0,
        +new Date(now) - +new Date(lastSession.startedAt),
      );
    }
    sessionId = uid("ses");
    v.sessions.unshift({
      id: sessionId,
      startedAt: now,
      durationMs: 0,
      pageCount: 1,
    });
    v.visitCount += 1;
  } else {
    sessionId = lastSession.id;
    lastSession.pageCount += 1;
    lastSession.endedAt = undefined;
  }

  v.pageViews.unshift({
    id: uid("pv"),
    path: input.path,
    enteredAt: now,
    durationMs: 0,
    sessionId,
  });
  v.pageViews = v.pageViews.slice(0, 200);
  v.sessions = v.sessions.slice(0, 50);
  v.path = input.path;
  v.lastSeenAt = now;
  v.hits += 1;
  if (input.userAgent) v.userAgent = input.userAgent;
  if (input.language) v.language = input.language;

  saveCrm(state);
  emitCrm(VISITOR_EVENT);
  return state;
}

export function heartbeatVisitorPage(input: {
  visitorKey: string;
  email?: string;
  path: string;
}) {
  const state = loadCrm();
  const v = findVisitor(state, {
    visitorKey: input.visitorKey,
    email: input.email,
  });
  if (!v) return state;
  const now = new Date().toISOString();
  const openPv =
    v.pageViews.find((p) => !p.leftAt && p.path === input.path) ||
    v.pageViews.find((p) => !p.leftAt);
  if (openPv) {
    openPv.durationMs = Math.max(
      0,
      +new Date(now) - +new Date(openPv.enteredAt),
    );
  }
  const ses = v.sessions[0];
  if (ses && !ses.endedAt) {
    ses.durationMs = Math.max(0, +new Date(now) - +new Date(ses.startedAt));
  }
  v.lastSeenAt = now;
  saveCrm(state);
  return state;
}

export function endVisitorPage(input: {
  visitorKey: string;
  email?: string;
  path?: string;
}) {
  const state = loadCrm();
  const v = findVisitor(state, {
    visitorKey: input.visitorKey,
    email: input.email,
  });
  if (!v) return state;
  const now = new Date().toISOString();
  const openPv = v.pageViews.find((p) => !p.leftAt);
  if (openPv) {
    openPv.leftAt = now;
    openPv.durationMs = Math.max(
      0,
      +new Date(now) - +new Date(openPv.enteredAt),
    );
    v.totalDurationMs += openPv.durationMs;
  }
  const ses = v.sessions[0];
  if (ses) {
    ses.endedAt = now;
    ses.durationMs = Math.max(0, +new Date(now) - +new Date(ses.startedAt));
  }
  v.lastSeenAt = now;
  saveCrm(state);
  emitCrm(VISITOR_EVENT);
  return state;
}

export function pushCustomerInbox(input: {
  kind: InboxKind;
  customerEmail: string;
  customerName: string;
  serviceId: string;
  serviceTitle: string;
  body: string;
  relatedRevisionId?: string;
}) {
  const state = loadCrm();
  if (!Array.isArray(state.inbox)) state.inbox = [];
  const now = new Date().toISOString();
  const item: CrmInboxItem = {
    id: uid("inb"),
    kind: input.kind,
    status: "open",
    customerEmail: input.customerEmail.toLowerCase(),
    customerName: input.customerName,
    serviceId: input.serviceId,
    serviceTitle: input.serviceTitle,
    body: input.body,
    createdAt: now,
    updatedAt: now,
    relatedRevisionId: input.relatedRevisionId,
  };
  state.inbox.unshift(item);
  state.activities.unshift({
    id: uid("ac"),
    type: input.kind === "revision" ? "revision" : input.kind === "message" ? "email" : "note",
    title:
      input.kind === "revision"
        ? "Customer revision request"
        : input.kind === "message"
          ? "Customer portal message"
          : `Customer ${input.kind}`,
    body: `${input.customerEmail}: ${input.body.slice(0, 120)}`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "order",
    relatedId: input.serviceId,
  });
  state.tasks.unshift({
    id: uid("tk"),
    title:
      input.kind === "revision"
        ? `Review revision — ${input.customerName}`
        : `Reply to ${input.customerName}`,
    status: "todo",
    priority: input.kind === "revision" ? "high" : "medium",
    dueAt: isoDays(1),
    ownerId: "own_admin",
    relatedType: "order",
    relatedId: input.serviceId,
    createdAt: now,
  });
  saveCrm(state);

  // Attach revision rounds onto the matching project
  if (input.kind === "revision") {
    const project = findOrCreateProjectForCustomer({
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      serviceId: input.serviceId,
      serviceTitle: input.serviceTitle,
    });
    addProjectRevision({
      projectId: project.id,
      note: input.body,
      title: `Customer request`,
      requestedBy: "customer",
      customerEmail: input.customerEmail,
      status: "pending",
    });
  } else if (input.kind === "message") {
    const project = findOrCreateProjectForCustomer({
      customerEmail: input.customerEmail,
      customerName: input.customerName,
      serviceId: input.serviceId,
      serviceTitle: input.serviceTitle,
    });
    const live = loadCrm();
    const p = live.orders.find((o) => o.id === project.id);
    if (p) {
      if (!Array.isArray(p.messages)) p.messages = [];
      p.messages.unshift({
        id: uid("pmsg"),
        kind: "reply",
        from: "customer",
        author: input.customerName,
        body: input.body,
        createdAt: now,
      });
      // Mark open designer requests as fulfilled when client replies
      for (const m of p.messages) {
        if (m.kind === "request" && m.status === "open") {
          m.status = "fulfilled";
        }
      }
      p.updatedAt = now;
      saveCrm(live);
    }
    emitCrm(INBOX_EVENT);
  } else {
    emitCrm(INBOX_EVENT);
  }
  emitCrm(VISITOR_EVENT);
  return loadCrm();
}

export function updateInboxItem(
  id: string,
  patch: Partial<Pick<CrmInboxItem, "status" | "adminReply">>,
) {
  const state = loadCrm();
  const item = state.inbox.find((i) => i.id === id);
  if (!item) return state;
  Object.assign(item, patch, { updatedAt: new Date().toISOString() });
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

export function onVisitorTracked(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(VISITOR_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(VISITOR_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function onInboxUpdated(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(INBOX_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(INBOX_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function formatDuration(ms: number) {
  if (!ms || ms < 1000) return "<1s";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  if (m < 60) return rem ? `${m}m ${rem}s` : `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

export function upsertLead(input: Partial<CrmLead> & { name: string; email: string }) {
  const state = loadCrm();
  if (input.id) {
    const i = state.leads.findIndex((l) => l.id === input.id);
    if (i >= 0) {
      state.leads[i] = {
        ...state.leads[i],
        ...input,
        updatedAt: new Date().toISOString(),
      };
    }
  } else {
    state.leads.unshift({
      id: uid("ld"),
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      company: input.company,
      source: input.source || "Manual",
      status: input.status || "new",
      score: input.score ?? 50,
      interest: input.interest || "Logo design",
      valueEstimate: input.valueEstimate ?? 499,
      ownerId: input.ownerId || "own_admin",
      notes: input.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
  saveCrm(state);
  return state;
}

export function upsertTask(input: Partial<CrmTask> & { title: string }) {
  const state = loadCrm();
  if (input.id) {
    const i = state.tasks.findIndex((t) => t.id === input.id);
    if (i >= 0) state.tasks[i] = { ...state.tasks[i], ...input };
  } else {
    state.tasks.unshift({
      id: uid("tk"),
      title: input.title,
      status: input.status || "todo",
      priority: input.priority || "medium",
      dueAt: input.dueAt || isoDays(2),
      ownerId: input.ownerId || "own_admin",
      projectId: input.projectId,
      designerId: input.designerId,
      designerName: input.designerName,
      relatedType: input.relatedType || (input.projectId ? "project" : undefined),
      relatedId: input.relatedId || input.projectId,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    });
  }
  saveCrm(state);
  emitCrm(VISITOR_EVENT);
  return state;
}

/** Assign a marketplace designer to a CRM project */
export function assignDesignerToProject(input: {
  projectId: string;
  designerId: string;
  designerName: string;
  createKickoffTask?: boolean;
}) {
  const state = loadCrm();
  const project = state.orders.find((o) => o.id === input.projectId);
  if (!project) return state;
  if (!Array.isArray(project.assignedDesignerIds)) {
    project.assignedDesignerIds = [];
  }
  if (!project.assignedDesignerIds.includes(input.designerId)) {
    project.assignedDesignerIds.unshift(input.designerId);
  }
  project.designerCount = Math.max(
    project.designerCount || 0,
    project.assignedDesignerIds.length,
  );
  project.updatedAt = new Date().toISOString();
  state.activities.unshift({
    id: uid("ac"),
    type: "status",
    title: `Designer assigned — ${project.orderId}`,
    body: `${input.designerName} → ${project.title || project.categoryName}`,
    createdAt: new Date().toISOString(),
    ownerId: "own_admin",
    relatedType: "project",
    relatedId: project.id,
  });
  if (input.createKickoffTask !== false) {
    state.tasks.unshift({
      id: uid("tk"),
      title: `Kickoff with ${input.designerName}`,
      status: "todo",
      priority: "high",
      dueAt: isoDays(1),
      ownerId: "own_admin",
      projectId: project.id,
      designerId: input.designerId,
      designerName: input.designerName,
      relatedType: "project",
      relatedId: project.id,
      notes: `Assigned to project ${project.orderId}`,
      createdAt: new Date().toISOString(),
    });
  }
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

export function unassignDesignerFromProject(
  projectId: string,
  designerId: string,
) {
  const state = loadCrm();
  const project = state.orders.find((o) => o.id === projectId);
  if (!project) return state;
  project.assignedDesignerIds = (project.assignedDesignerIds || []).filter(
    (id) => id !== designerId,
  );
  project.updatedAt = new Date().toISOString();
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

export function assignTaskToDesigner(input: {
  title: string;
  designerId: string;
  designerName: string;
  projectId?: string;
  priority?: TaskPriority;
  dueAt?: string;
  notes?: string;
}) {
  return upsertTask({
    title: input.title,
    designerId: input.designerId,
    designerName: input.designerName,
    projectId: input.projectId,
    priority: input.priority || "medium",
    dueAt: input.dueAt || isoDays(2),
    notes: input.notes,
    status: "todo",
    ownerId: "own_admin",
    relatedType: input.projectId ? "project" : undefined,
    relatedId: input.projectId,
  });
}

export function addProjectRevision(input: {
  projectId: string;
  title?: string;
  note: string;
  requestedBy?: "customer" | "admin";
  customerEmail?: string;
  status?: ProjectRevisionStatus;
}) {
  const state = loadCrm();
  const project = state.orders.find((o) => o.id === input.projectId);
  if (!project) return state;
  const now = new Date().toISOString();
  const revs = Array.isArray(project.revisions) ? project.revisions : [];
  if (revs.length >= (project.revisionLimit || 3)) {
    return state;
  }
  const round = revs.length + 1;
  const rev: CrmProjectRevision = {
    id: uid("prv"),
    round,
    title: input.title || `Revision round ${round}`,
    note: input.note,
    status: input.status || "pending",
    requestedBy: input.requestedBy || "admin",
    customerEmail: input.customerEmail || project.customerEmail,
    createdAt: now,
    updatedAt: now,
  };
  project.revisions = [rev, ...revs];
  project.revisionsUsed = project.revisions.length;
  project.status = "revisions";
  project.updatedAt = now;
  state.activities.unshift({
    id: uid("ac"),
    type: "revision",
    title: `${project.orderId} · Round ${round}`,
    body: rev.note.slice(0, 160),
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "project",
    relatedId: project.id,
  });
  // Auto task for this revision round
  state.tasks.unshift({
    id: uid("tk"),
    title: `Handle revision R${round} — ${project.customerName}`,
    status: "todo",
    priority: "high",
    dueAt: isoDays(1),
    ownerId: "own_admin",
    projectId: project.id,
    relatedType: "project",
    relatedId: project.id,
    notes: rev.note,
    createdAt: now,
  });
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

export function updateProjectRevision(
  projectId: string,
  revisionId: string,
  patch: Partial<
    Pick<CrmProjectRevision, "status" | "adminReply" | "title" | "note">
  >,
) {
  const state = loadCrm();
  const project = state.orders.find((o) => o.id === projectId);
  if (!project) return state;
  const rev = project.revisions.find((r) => r.id === revisionId);
  if (!rev) return state;
  Object.assign(rev, patch, { updatedAt: new Date().toISOString() });
  project.updatedAt = new Date().toISOString();
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

/** Designer portal → remarks or request assets/info from client */
export function postDesignerProjectMessage(input: {
  projectId: string;
  designerId: string;
  designerName: string;
  body: string;
  kind: "remark" | "request";
}) {
  const trimmed = input.body.trim();
  if (trimmed.length < 2) return null;

  const state = loadCrm();
  const project = state.orders.find((o) => o.id === input.projectId);
  if (!project) return null;
  if (
    Array.isArray(project.assignedDesignerIds) &&
    project.assignedDesignerIds.length > 0 &&
    !project.assignedDesignerIds.includes(input.designerId)
  ) {
    return null;
  }

  const now = new Date().toISOString();
  if (!Array.isArray(project.messages)) project.messages = [];

  const msg: CrmProjectMessage = {
    id: uid("pmsg"),
    kind: input.kind,
    from: "designer",
    author: input.designerName,
    designerId: input.designerId,
    body: trimmed,
    createdAt: now,
    status: input.kind === "request" ? "open" : undefined,
  };
  project.messages.unshift(msg);
  project.updatedAt = now;

  state.activities.unshift({
    id: uid("ac"),
    type: input.kind === "request" ? "email" : "note",
    title:
      input.kind === "request"
        ? `Designer request — ${project.orderId}`
        : `Designer remark — ${project.orderId}`,
    body: `${input.designerName}: ${trimmed.slice(0, 140)}`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "project",
    relatedId: project.id,
  });

  if (input.kind === "request") {
    state.tasks.unshift({
      id: uid("tk"),
      title: `Client action needed — ${project.customerName}`,
      status: "todo",
      priority: "high",
      dueAt: isoDays(1),
      ownerId: "own_admin",
      projectId: project.id,
      designerId: input.designerId,
      designerName: input.designerName,
      relatedType: "project",
      relatedId: project.id,
      notes: trimmed,
      createdAt: now,
    });
    if (!Array.isArray(state.inbox)) state.inbox = [];
    state.inbox.unshift({
      id: uid("inb"),
      kind: "message",
      status: "open",
      customerEmail: project.customerEmail.toLowerCase(),
      customerName: project.customerName,
      serviceId: project.serviceId || project.id,
      serviceTitle: `${project.categoryName} · ${project.packageName}`,
      body: `[Designer request · ${input.designerName}] ${trimmed}`,
      createdAt: now,
      updatedAt: now,
    });
  }

  saveCrm(state);
  emitCrm(INBOX_EVENT);

  // Sync into customer My account portal
  try {
    const { designerMessageToCustomer } = require("@/lib/auth-storage") as typeof import("@/lib/auth-storage");
    designerMessageToCustomer({
      customerEmail: project.customerEmail,
      serviceId: project.serviceId,
      designerName: input.designerName,
      body: trimmed,
      kind: input.kind,
    });
  } catch {
    /* ignore if customer account missing */
  }

  return msg;
}

export function updateProjectMessageStatus(
  projectId: string,
  messageId: string,
  status: "open" | "fulfilled" | "closed",
) {
  const state = loadCrm();
  const project = state.orders.find((o) => o.id === projectId);
  if (!project || !Array.isArray(project.messages)) return state;
  const msg = project.messages.find((m) => m.id === messageId);
  if (!msg) return state;
  msg.status = status;
  project.updatedAt = new Date().toISOString();
  saveCrm(state);
  emitCrm(INBOX_EVENT);
  return state;
}

export function findOrCreateProjectForCustomer(input: {
  customerEmail: string;
  customerName: string;
  serviceId?: string;
  serviceTitle?: string;
}) {
  const state = loadCrm();
  const email = input.customerEmail.toLowerCase();
  let project =
    (input.serviceId &&
      state.orders.find((o) => o.serviceId === input.serviceId)) ||
    state.orders.find(
      (o) =>
        o.customerEmail === email &&
        o.status !== "completed" &&
        o.status !== "cancelled",
    ) ||
    state.orders.find((o) => o.customerEmail === email);

  if (!project) {
    const now = new Date().toISOString();
    project = {
      id: uid("or"),
      orderId: `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
      title: input.serviceTitle || `Project — ${input.customerName}`,
      customerName: input.customerName,
      customerEmail: email,
      categoryName: input.serviceTitle?.split("·")[0]?.trim() || "Design",
      packageName: "Gold",
      amount: 499,
      status: "revisions",
      paymentStatus: "paid",
      createdAt: now,
      updatedAt: now,
      designerCount: 0,
      revisionLimit: 3,
      revisionsUsed: 0,
      revisions: [],
      messages: [],
      serviceId: input.serviceId,
      assignedDesignerIds: [],
    };
    state.orders.unshift(project);
    saveCrm(state);
  } else if (input.serviceId && !project.serviceId) {
    project.serviceId = input.serviceId;
    saveCrm(state);
  }
  return project;
}

export function addActivity(
  input: Omit<CrmActivity, "id" | "createdAt"> & { createdAt?: string },
) {
  const state = loadCrm();
  state.activities.unshift({
    ...input,
    id: uid("ac"),
    createdAt: input.createdAt || new Date().toISOString(),
  });
  saveCrm(state);
  return state;
}

export function upsertContact(
  input: Partial<CrmContact> & { name: string; email: string },
) {
  const state = loadCrm();
  const now = new Date().toISOString();
  if (input.id) {
    const i = state.contacts.findIndex((c) => c.id === input.id);
    if (i >= 0) {
      state.contacts[i] = {
        ...state.contacts[i],
        ...input,
        email: input.email.toLowerCase(),
        lastTouchAt: now,
      };
    }
  } else {
    state.contacts.unshift({
      id: uid("ct"),
      name: input.name,
      email: input.email.toLowerCase(),
      phone: input.phone,
      title: input.title,
      companyId: input.companyId,
      ownerId: input.ownerId || "own_admin",
      tags: input.tags || [],
      createdAt: now,
      lastTouchAt: now,
    });
  }
  saveCrm(state);
  return state;
}

export function upsertCompany(
  input: Partial<CrmCompany> & { name: string },
) {
  const state = loadCrm();
  if (input.id) {
    const i = state.companies.findIndex((c) => c.id === input.id);
    if (i >= 0) {
      state.companies[i] = { ...state.companies[i], ...input };
    }
  } else {
    state.companies.unshift({
      id: uid("co"),
      name: input.name,
      industry: input.industry || "General",
      website: input.website,
      size: input.size || "1-10",
      country: input.country || "United States",
      ownerId: input.ownerId || "own_admin",
      createdAt: new Date().toISOString(),
      notes: input.notes,
    });
  }
  saveCrm(state);
  return state;
}

export function upsertOrder(
  input: Partial<CrmOrder> & {
    customerName: string;
    customerEmail: string;
    categoryName: string;
    packageName: string;
    amount: number;
  },
) {
  const state = loadCrm();
  const now = new Date().toISOString();
  if (input.id) {
    const i = state.orders.findIndex((o) => o.id === input.id);
    if (i >= 0) {
      state.orders[i] = {
        ...state.orders[i],
        ...input,
        updatedAt: now,
      };
    }
  } else {
    const orderId =
      input.orderId ||
      `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    state.orders.unshift({
      id: uid("or"),
      orderId,
      title: input.title || `${input.categoryName} — ${input.customerName}`,
      customerName: input.customerName,
      customerEmail: input.customerEmail.toLowerCase(),
      categoryName: input.categoryName,
      packageName: input.packageName,
      amount: input.amount,
      status: input.status || "in_progress",
      paymentStatus: input.paymentStatus || "paid",
      createdAt: now,
      updatedAt: now,
      designerCount: input.designerCount ?? 1,
      revisionLimit:
        input.revisionLimit ??
        (input.packageName.toLowerCase().includes("platinum") ? 5 : 3),
      revisionsUsed: input.revisionsUsed ?? 0,
      revisions: input.revisions ?? [],
      messages: input.messages ?? [],
      serviceId: input.serviceId,
      assignedDesignerIds: input.assignedDesignerIds ?? [],
    });
  }
  saveCrm(state);
  return state;
}

export function upsertDesignerNote(
  input: Partial<CrmDesignerNote> & { designerId: string },
) {
  const state = loadCrm();
  const i = state.designerNotes.findIndex(
    (n) => n.designerId === input.designerId,
  );
  const row: CrmDesignerNote = {
    designerId: input.designerId,
    status: input.status || "active",
    notes: input.notes || "",
    tags: input.tags || [],
    ownerId: input.ownerId || "own_admin",
    updatedAt: new Date().toISOString(),
  };
  if (i >= 0) state.designerNotes[i] = { ...state.designerNotes[i], ...row };
  else state.designerNotes.unshift(row);
  saveCrm(state);
  return state;
}

export function upsertDeal(
  input: Partial<CrmDeal> & { title: string; value: number },
) {
  const state = loadCrm();
  const now = new Date().toISOString();
  if (input.id) {
    const i = state.deals.findIndex((d) => d.id === input.id);
    if (i >= 0) {
      state.deals[i] = { ...state.deals[i], ...input, updatedAt: now };
    }
  } else {
    state.deals.unshift({
      id: uid("dl"),
      title: input.title,
      stage: input.stage || "lead",
      value: input.value,
      currency: input.currency || "USD",
      probability: input.probability ?? 20,
      contactId: input.contactId,
      companyId: input.companyId,
      leadId: input.leadId,
      ownerId: input.ownerId || "own_admin",
      category: input.category,
      packageName: input.packageName,
      closeDate: input.closeDate || isoDays(14),
      createdAt: now,
      updatedAt: now,
      notes: input.notes,
    });
  }
  saveCrm(state);
  return state;
}

export function crmStats(state: CrmState) {
  const openDeals = state.deals.filter(
    (d) => d.stage !== "won" && d.stage !== "lost",
  );
  const pipeline = openDeals.reduce((s, d) => s + d.value, 0);
  const weighted = openDeals.reduce(
    (s, d) => s + (d.value * d.probability) / 100,
    0,
  );
  const won = state.deals.filter((d) => d.stage === "won");
  const wonValue = won.reduce((s, d) => s + d.value, 0);
  const newLeads = state.leads.filter((l) => l.status === "new").length;
  const overdueTasks = state.tasks.filter(
    (t) => t.status !== "done" && new Date(t.dueAt) < new Date(),
  ).length;
  const ordersRevenue = state.orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((s, o) => s + o.amount, 0);

  return {
    pipeline,
    weighted: Math.round(weighted),
    wonValue,
    wonCount: won.length,
    openDeals: openDeals.length,
    newLeads,
    totalLeads: state.leads.length,
    contacts: state.contacts.length,
    companies: state.companies.length,
    overdueTasks,
    openTasks: state.tasks.filter((t) => t.status !== "done").length,
    ordersRevenue,
    ordersCount: state.orders.length,
    visitors: state.visitors?.length ?? 0,
    inboxOpen:
      state.inbox?.filter((i) => i.status === "open" || i.status === "in_progress")
        .length ?? 0,
  };
}

export function money(n: number) {
  return `$${n.toLocaleString("en-US")}`;
}

export function relativeDay(iso: string) {
  const diff = Math.round(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  if (diff > 1) return `In ${diff}d`;
  return `${Math.abs(diff)}d ago`;
}

export function onReviewsUpdated(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const handler = () => cb();
  window.addEventListener(REVIEW_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(REVIEW_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}

export function listReviews(status?: ReviewStatus | "all") {
  const reviews = loadCrm().reviews || [];
  if (!status || status === "all") {
    return [...reviews].sort(
      (a, b) => +new Date(b.createdAt) - +new Date(a.createdAt),
    );
  }
  return reviews
    .filter((r) => r.status === status)
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
}

export function getApprovedReviewsForDesigner(designerId: string) {
  return listReviews("approved").filter((r) => r.designerId === designerId);
}

export function getReviewForService(serviceId: string) {
  return (loadCrm().reviews || []).find((r) => r.serviceId === serviceId);
}

export function submitProjectReview(input: {
  designerId: string;
  designerName: string;
  customerName: string;
  customerEmail: string;
  rating: number;
  body: string;
  projectId?: string;
  orderId?: string;
  serviceId?: string;
  categoryName?: string;
}): CrmReview | null {
  const rating = Math.round(input.rating);
  const body = input.body.trim();
  if (rating < 1 || rating > 5) return null;
  if (body.length < 12) return null;
  if (!input.designerId) return null;

  const state = loadCrm();
  if (!Array.isArray(state.reviews)) state.reviews = [];
  const email = input.customerEmail.toLowerCase();

  // One review per service/project
  const existing = state.reviews.find(
    (r) =>
      (input.serviceId && r.serviceId === input.serviceId) ||
      (input.projectId && r.projectId === input.projectId),
  );
  if (existing && existing.status !== "rejected") {
    return existing;
  }

  const now = new Date().toISOString();
  const review: CrmReview = {
    id: uid("rv"),
    projectId: input.projectId,
    orderId: input.orderId,
    serviceId: input.serviceId,
    designerId: input.designerId,
    designerName: input.designerName,
    customerName: input.customerName,
    customerEmail: email,
    rating,
    body,
    categoryName: input.categoryName,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  if (existing) {
    const i = state.reviews.findIndex((r) => r.id === existing.id);
    const updated = {
      ...review,
      id: existing.id,
      createdAt: existing.createdAt,
    };
    state.reviews[i] = updated;
  } else {
    state.reviews.unshift(review);
  }

  if (input.projectId) {
    const project = state.orders.find((o) => o.id === input.projectId);
    if (project) {
      project.status = "completed";
      project.updatedAt = now;
    }
  } else if (input.serviceId) {
    const project = state.orders.find((o) => o.serviceId === input.serviceId);
    if (project) {
      project.status = "completed";
      project.updatedAt = now;
    }
  }

  state.activities.unshift({
    id: uid("ac"),
    type: "note",
    title: "Customer review submitted",
    body: `${input.customerName} rated ${input.designerName} ${rating}/5 — awaiting admin approval`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "project",
    relatedId: input.projectId,
  });

  const saved =
    state.reviews.find(
      (r) =>
        (input.serviceId && r.serviceId === input.serviceId) ||
        (input.projectId && r.projectId === input.projectId),
    ) || state.reviews[0];

  saveCrm(state);
  emitCrm(REVIEW_EVENT, saved);
  emitCrm(INBOX_EVENT);
  return saved;
}

export function setReviewStatus(
  reviewId: string,
  status: ReviewStatus,
  adminNote?: string,
) {
  const state = loadCrm();
  if (!Array.isArray(state.reviews)) state.reviews = [];
  const review = state.reviews.find((r) => r.id === reviewId);
  if (!review) return state;
  const now = new Date().toISOString();
  review.status = status;
  review.updatedAt = now;
  review.reviewedAt = now;
  if (adminNote !== undefined) review.adminNote = adminNote.trim() || undefined;

  state.activities.unshift({
    id: uid("ac"),
    type: "note",
    title: status === "approved" ? "Review approved" : "Review rejected",
    body: `${review.customerName} → ${review.designerName} (${review.rating}/5)`,
    createdAt: now,
    ownerId: "own_admin",
    relatedType: "project",
    relatedId: review.projectId,
  });

  saveCrm(state);
  emitCrm(REVIEW_EVENT, review);
  emitCrm(INBOX_EVENT);
  return state;
}

export function designerPublicRating(designerId: string, fallback: {
  rating: number;
  reviews: number;
}) {
  const approved = getApprovedReviewsForDesigner(designerId);
  if (!approved.length) return fallback;
  const sum = approved.reduce((s, r) => s + r.rating, 0);
  const avg =
    (fallback.rating * fallback.reviews + sum) /
    (fallback.reviews + approved.length);
  return {
    rating: Math.round(avg * 100) / 100,
    reviews: fallback.reviews + approved.length,
  };
}
