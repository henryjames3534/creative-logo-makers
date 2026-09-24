"use client";

/** Designer portal session — separate from customer + admin */

import {
  getDesignerById,
  getDesignerByHandle,
  designers,
} from "@/data/designers";
import {
  loadCrm,
  type CrmOrder,
  type CrmProjectRevision,
  type CrmState,
  type CrmTask,
} from "@/lib/crm-storage";
import { safeDesignerImage } from "@/lib/designer-media";

const SESSION_KEY = "clm_designer_session_v1";
const DEMO_PASSWORD = "designer123";
const FALLBACK_AVATAR = "/clm/hires/designer-man.jpg";

export type DesignerSession = {
  designerId: string;
  name: string;
  handle: string;
  avatar?: string;
};

export { safeDesignerImage } from "@/lib/designer-media";

function sessionFromProfile(profile: {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  image?: string;
}): DesignerSession {
  const catalogImg = profile.avatar || profile.image;
  return {
    designerId: profile.id,
    name: profile.name,
    handle: profile.handle,
    avatar: safeDesignerImage(catalogImg, FALLBACK_AVATAR),
  };
}

export function getDesignerSession(): DesignerSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw) as DesignerSession;
    // Always refresh avatar from live catalog so stale external avatar URLs are cleared
    const profile = getDesignerById(stored.designerId);
    if (profile) {
      const fresh = sessionFromProfile(profile);
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(fresh));
      return fresh;
    }
    return {
      ...stored,
      avatar: safeDesignerImage(stored.avatar),
    };
  } catch {
    return null;
  }
}

export function designerLogin(input: {
  handleOrId: string;
  password: string;
}): { ok: true; session: DesignerSession } | { ok: false; error: string } {
  const key = input.handleOrId.trim().replace(/^@/, "");
  if (!key) return { ok: false, error: "Enter designer handle or ID." };
  if (input.password !== DEMO_PASSWORD) {
    return { ok: false, error: "Wrong password. Demo: designer123" };
  }

  const profile =
    getDesignerById(key) ||
    getDesignerByHandle(key) ||
    designers.find(
      (d) =>
        d.handle.toLowerCase() === key.toLowerCase() ||
        d.name.toLowerCase() === key.toLowerCase(),
    );

  if (!profile) {
    return {
      ok: false,
      error: "Designer not found. Use a site designer handle.",
    };
  }

  const session = sessionFromProfile(profile);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { ok: true, session };
}

export function designerLogout() {
  sessionStorage.removeItem(SESSION_KEY);
}

export type DesignerProjectView = {
  project: CrmOrder;
  tasks: CrmTask[];
  openRevisions: CrmProjectRevision[];
  allRevisions: CrmProjectRevision[];
};

export function getDesignerWorkload(designerId: string, state?: CrmState) {
  const crm = state || loadCrm();
  const projects = crm.orders.filter((o) =>
    (o.assignedDesignerIds || []).includes(designerId),
  );
  const tasks = crm.tasks.filter((t) => t.designerId === designerId);
  const views: DesignerProjectView[] = projects.map((project) => {
    const projectTasks = tasks.filter((t) => t.projectId === project.id);
    const allRevisions = [...(project.revisions || [])].sort(
      (a, b) => b.round - a.round,
    );
    return {
      project,
      tasks: projectTasks,
      openRevisions: allRevisions.filter(
        (r) => r.status === "pending" || r.status === "in_progress",
      ),
      allRevisions,
    };
  });

  const orphanTasks = tasks.filter(
    (t) => !t.projectId || !projects.some((p) => p.id === t.projectId),
  );

  return {
    projects: views,
    tasks,
    orphanTasks,
    openTaskCount: tasks.filter((t) => t.status !== "done").length,
    openRevisionCount: views.reduce((n, v) => n + v.openRevisions.length, 0),
    projectCount: projects.length,
  };
}

export { DEMO_PASSWORD };
