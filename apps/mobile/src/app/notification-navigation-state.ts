type TabRouteName = "index" | "iuran" | "layanan" | "more";

const TAB_ROUTE_NAMES: TabRouteName[] = ["index", "iuran", "layanan", "more"];

let notificationSourceTab: TabRouteName | null = null;
let pendingSkipAnimationTab: TabRouteName | null = null;

function isTabRouteName(value: unknown): value is TabRouteName {
    if (typeof value !== "string") {
        return false;
    }

    return TAB_ROUTE_NAMES.includes(value as TabRouteName);
}

export function setNotificationSourceTab(tab: unknown) {
    if (!isTabRouteName(tab)) {
        return;
    }

    notificationSourceTab = tab;
}

export function markNotificationClosed() {
    if (notificationSourceTab) {
        pendingSkipAnimationTab = notificationSourceTab;
    }

    notificationSourceTab = null;
}

export function consumeSkipAnimationForTab(tab: TabRouteName) {
    if (pendingSkipAnimationTab !== tab) {
        return false;
    }

    pendingSkipAnimationTab = null;
    return true;
}

