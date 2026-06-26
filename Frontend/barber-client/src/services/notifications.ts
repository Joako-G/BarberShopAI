import type { ReactNode } from "react";
import { sileo } from "sileo";

interface NotificationOptions {
    title: string;
    description?: ReactNode | string;
}

const defaultDuration = 5000;

export function notifySuccess({ title, description }: NotificationOptions): void {
    sileo.success({
        title,
        description,
        duration: defaultDuration,
    });
}

export function notifyError({ title, description }: NotificationOptions): void {
    sileo.error({
        title,
        description,
        duration: 6500,
    });
}

export function notifyWarning({ title, description }: NotificationOptions): void {
    sileo.warning({
        title,
        description,
        duration: 6000,
    });
}

export function notifyInfo({ title, description }: NotificationOptions): void {
    sileo.info({
        title,
        description,
        duration: defaultDuration,
    });
}
