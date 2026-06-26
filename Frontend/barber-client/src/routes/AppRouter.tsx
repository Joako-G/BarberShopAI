import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { DashboardPage } from "../pages/DashboardPage";
import { CustomerPage } from "../pages/CustomersPage";
import { ServicesPage } from "../pages/ServicesPage";
import { AppointmentsPage } from "../pages/AppointmentsPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { NewServicePage } from "../pages/NewServicePage";
import { EditServicePage } from "../pages/EditServicePage";
import { NewCustomerPage } from "../pages/NewCustomerPage";
import { EditCustomerPage } from "../pages/EditCustomerPage";
import { NewAppointmentPage } from "../pages/NewAppointmentPage";
import { EditAppointmentPage } from "../pages/EditAppointmentPage";
import { PublicBookingPage } from "../pages/PublicBookingPage";
import { NotFoundPage } from "../pages/NotFoundPage";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/reservar" replace />} />

                <Route path="/reservar" element={<PublicBookingPage />} />
                <Route path="/login" element={<LoginPage />} />

                <Route element={<ProtectedRoute />}>
                    <Route element={<DashboardLayout />}>
                        <Route path="/dashboard" element={<DashboardPage />} />

                        <Route path="/customers" element={<CustomerPage />} />
                        <Route path="/customers/new" element={<NewCustomerPage />} />
                        <Route path="/customers/:id/edit" element={<EditCustomerPage />} />

                        <Route path="/services" element={<ServicesPage />} />
                        <Route path="/services/new" element={<NewServicePage />} />
                        <Route path="/services/:id/edit" element={<EditServicePage />} />

                        <Route path="/appointments" element={<AppointmentsPage />} />
                        <Route path="/appointments/new" element={<NewAppointmentPage />} />
                        <Route path="/appointments/:id/edit" element={<EditAppointmentPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </BrowserRouter >
    )
}
