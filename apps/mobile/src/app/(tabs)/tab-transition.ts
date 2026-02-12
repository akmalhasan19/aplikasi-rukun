import { useSyncExternalStore } from "react";

export type TabRouteName = "index" | "iuran" | "layanan" | "more";

type TabTransitionState = {
    from: TabRouteName | null;
    to: TabRouteName | null;
};

const TAB_ROUTE_NAMES: TabRouteName[] = ["index", "iuran", "layanan", "more"];

let transitionState: TabTransitionState = {
    from: null,
    to: null,
};

const listeners = new Set<() => void>();

function emitChange() {
    listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

function getSnapshot() {
    return transitionState;
}

function isTabRouteName(name: unknown): name is TabRouteName {
    if (typeof name !== "string") {
        return false;
    }

    return TAB_ROUTE_NAMES.includes(name as TabRouteName);
}

function resolveActiveRouteName(state: any): string | null {
    if (!state || !Array.isArray(state.routes) || state.routes.length === 0) {
        return null;
    }

    const activeIndex = typeof state.index === "number" ? state.index : 0;
    const activeRoute = state.routes[activeIndex];
    if (!activeRoute) {
        return null;
    }

    if (activeRoute.state) {
        const nestedName = resolveActiveRouteName(activeRoute.state);
        if (nestedName) {
            return nestedName;
        }
    }

    return activeRoute.name ?? null;
}

export function useTabTransition() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function primeActiveTab(initialTab: TabRouteName) {
    if (transitionState.to) {
        return;
    }

    transitionState = {
        from: null,
        to: initialTab,
    };
    emitChange();
}

export function setActiveTab(nextTab: TabRouteName) {
    if (transitionState.to === nextTab) {
        return;
    }

    transitionState = {
        from: transitionState.to,
        to: nextTab,
    };
    emitChange();
}

export function syncActiveTabFromNavigatorState(state: any) {
    const activeRouteName = resolveActiveRouteName(state);
    if (!isTabRouteName(activeRouteName)) {
        return;
    }

    setActiveTab(activeRouteName);
}
