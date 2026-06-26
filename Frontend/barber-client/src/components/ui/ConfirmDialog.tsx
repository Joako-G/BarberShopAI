import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "./alert-dialog";

interface ConfirmDialogProps {
    cancelText?: string;
    confirmText?: string;
    description: string;
    loading?: boolean;
    open: boolean;
    title: string;
    onConfirm: () => void;
    onOpenChange: (open: boolean) => void;
}

export function ConfirmDialog({
    cancelText = "Cancelar",
    confirmText = "Confirmar",
    description,
    loading = false,
    open,
    title,
    onConfirm,
    onOpenChange,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={loading ? undefined : onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{title}</AlertDialogTitle>
                    <AlertDialogDescription>{description}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={loading}>{cancelText}</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={loading}
                        onClick={(event) => {
                            event.preventDefault();
                            onConfirm();
                        }}
                    >
                        {loading ? "Procesando..." : confirmText}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
