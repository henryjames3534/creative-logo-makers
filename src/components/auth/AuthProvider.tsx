"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  addServiceFromBrief,
  getCurrentUser,
  refreshServiceUpdates,
  requestRevision,
  seedDemoContest,
  selectWinningConcept,
  sendServiceMessage,
  signIn as storageSignIn,
  signInWithGoogle as storageSignInWithGoogle,
  signOut as storageSignOut,
  signUp as storageSignUp,
  takePendingBrief,
  toggleConceptLike,
  markServiceCompleted,
  type PendingBrief,
  type SessionUser,
} from "@/lib/auth-storage";
import { pushCustomerInbox, submitProjectReview } from "@/lib/crm-storage";
import { migrateLegacyStorage } from "@/lib/migrate-legacy-storage";

type AuthContextValue = {
  user: SessionUser | null;
  ready: boolean;
  signUp: (input: {
    name: string;
    email: string;
    password: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  signIn: (input: {
    email: string;
    password: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  signInWithGoogle: (profile: {
    name: string;
    email: string;
    picture?: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  signOut: () => void;
  attachBrief: (brief: PendingBrief) => void;
  refreshUpdates: () => void;
  seedDemo: () => void;
  requestRevisionOn: (serviceId: string, note: string) => void;
  sendMessageOn: (serviceId: string, body: string) => void;
  likeConcept: (serviceId: string, conceptId: string) => void;
  selectWinner: (serviceId: string, conceptId: string) => void;
  completeWithReview: (input: {
    serviceId: string;
    rating: number;
    body: string;
    designerId: string;
    designerName: string;
  }) => { ok: true } | { ok: false; error: string };
};

const AuthContext = createContext<AuthContextValue | null>(null);

function claimPending(email: string): SessionUser | null {
  const pending = takePendingBrief();
  if (!pending) return null;
  return addServiceFromBrief(email, pending);
}

function applyEmail(
  setUser: (u: SessionUser | null) => void,
  fn: (email: string) => SessionUser | null,
) {
  const email = getCurrentUser()?.email;
  if (!email) return;
  const next = fn(email);
  if (next) setUser(next);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    migrateLegacyStorage();
    const current = getCurrentUser();
    if (current) {
      const claimed = claimPending(current.email);
      setUser(claimed ?? current);
    } else {
      setUser(null);
    }
    setReady(true);
  }, []);

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string }) => {
      const res = await storageSignUp(input);
      if (!res.ok) return res;
      const claimed = claimPending(res.user.email);
      setUser(claimed ?? res.user);
      return { ok: true as const };
    },
    [],
  );

  const signIn = useCallback(
    async (input: { email: string; password: string }) => {
      const res = await storageSignIn(input);
      if (!res.ok) return res;
      const claimed = claimPending(res.user.email);
      setUser(claimed ?? res.user);
      return { ok: true as const };
    },
    [],
  );

  const signInWithGoogle = useCallback(
    async (profile: { name: string; email: string; picture?: string }) => {
      const res = await storageSignInWithGoogle(profile);
      if (!res.ok) return res;
      const claimed = claimPending(res.user.email);
      setUser(claimed ?? res.user);
      return { ok: true as const };
    },
    [],
  );

  const signOut = useCallback(() => {
    storageSignOut();
    setUser(null);
  }, []);

  const attachBrief = useCallback((brief: PendingBrief) => {
    applyEmail(setUser, (email) => addServiceFromBrief(email, brief));
  }, []);

  const refreshUpdates = useCallback(() => {
    applyEmail(setUser, refreshServiceUpdates);
  }, []);

  const seedDemo = useCallback(() => {
    applyEmail(setUser, seedDemoContest);
  }, []);

  const requestRevisionOn = useCallback((serviceId: string, note: string) => {
    const before = getCurrentUser();
    applyEmail(setUser, (email) => requestRevision(email, serviceId, note));
    const after = getCurrentUser();
    if (!before || !after) return;
    const svc = after.services.find((s) => s.id === serviceId);
    if (!svc) return;
    const latest = svc.revisions[0];
    if (!latest || latest.note !== note.trim()) return;
    pushCustomerInbox({
      kind: "revision",
      customerEmail: after.email,
      customerName: after.name,
      serviceId: svc.id,
      serviceTitle: `${svc.categoryName} · ${svc.packageName}`,
      body: latest.note,
      relatedRevisionId: latest.id,
    });
  }, []);

  const sendMessageOn = useCallback((serviceId: string, body: string) => {
    applyEmail(setUser, (email) => sendServiceMessage(email, serviceId, body));
    const after = getCurrentUser();
    if (!after) return;
    const svc = after.services.find((s) => s.id === serviceId);
    if (!svc) return;
    pushCustomerInbox({
      kind: "message",
      customerEmail: after.email,
      customerName: after.name,
      serviceId: svc.id,
      serviceTitle: `${svc.categoryName} · ${svc.packageName}`,
      body: body.trim(),
    });
  }, []);

  const likeConcept = useCallback((serviceId: string, conceptId: string) => {
    applyEmail(setUser, (email) => toggleConceptLike(email, serviceId, conceptId));
    const after = getCurrentUser();
    const svc = after?.services.find((s) => s.id === serviceId);
    const concept = svc?.concepts.find((c) => c.id === conceptId);
    if (after && svc && concept?.liked) {
      pushCustomerInbox({
        kind: "like",
        customerEmail: after.email,
        customerName: after.name,
        serviceId: svc.id,
        serviceTitle: `${svc.categoryName} · ${svc.packageName}`,
        body: `Liked concept: ${concept.title || conceptId}`,
      });
    }
  }, []);

  const selectWinner = useCallback((serviceId: string, conceptId: string) => {
    applyEmail(setUser, (email) =>
      selectWinningConcept(email, serviceId, conceptId),
    );
    const after = getCurrentUser();
    const svc = after?.services.find((s) => s.id === serviceId);
    const concept = svc?.concepts.find((c) => c.id === conceptId);
    if (after && svc && concept) {
      pushCustomerInbox({
        kind: "winner",
        customerEmail: after.email,
        customerName: after.name,
        serviceId: svc.id,
        serviceTitle: `${svc.categoryName} · ${svc.packageName}`,
        body: `Selected winner: ${concept.title || conceptId}`,
      });
    }
  }, []);

  const completeWithReview = useCallback(
    (input: {
      serviceId: string;
      rating: number;
      body: string;
      designerId: string;
      designerName: string;
    }): { ok: true } | { ok: false; error: string } => {
      const current = getCurrentUser();
      if (!current) return { ok: false, error: "Please sign in first." };
      const svc = current.services.find((s) => s.id === input.serviceId);
      if (!svc) return { ok: false, error: "Service not found." };
      if (svc.reviewId && svc.reviewStatus !== "rejected") {
        return {
          ok: false,
          error: "You already submitted a review for this project.",
        };
      }
      if (input.rating < 1 || input.rating > 5) {
        return { ok: false, error: "Please choose a rating from 1 to 5 stars." };
      }
      if (input.body.trim().length < 12) {
        return {
          ok: false,
          error: "Please write a short review (at least 12 characters).",
        };
      }
      if (!input.designerId) {
        return { ok: false, error: "Select which designer you’re reviewing." };
      }

      const review = submitProjectReview({
        designerId: input.designerId,
        designerName: input.designerName,
        customerName: current.name,
        customerEmail: current.email,
        rating: input.rating,
        body: input.body,
        serviceId: svc.id,
        orderId: svc.orderId,
        categoryName: svc.categoryName,
      });
      if (!review) {
        return { ok: false, error: "Could not submit review. Try again." };
      }

      const next = markServiceCompleted(current.email, svc.id, {
        reviewId: review.id,
        reviewStatus: review.status,
        designerId: input.designerId,
        designerName: input.designerName,
      });
      if (next) setUser(next);
      return { ok: true };
    },
    [],
  );

  const value = useMemo(
    () => ({
      user,
      ready,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      attachBrief,
      refreshUpdates,
      seedDemo,
      requestRevisionOn,
      sendMessageOn,
      likeConcept,
      selectWinner,
      completeWithReview,
    }),
    [
      user,
      ready,
      signUp,
      signIn,
      signInWithGoogle,
      signOut,
      attachBrief,
      refreshUpdates,
      seedDemo,
      requestRevisionOn,
      sendMessageOn,
      likeConcept,
      selectWinner,
      completeWithReview,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
