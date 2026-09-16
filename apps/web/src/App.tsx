import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout.tsx";
import { AlertsPage } from "./pages/AlertsPage.tsx";
import { DeviceDetail } from "./pages/DeviceDetail.tsx";
import { DeviceList } from "./pages/DeviceList.tsx";
import { DeviceSettings } from "./pages/DeviceSettings.tsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<DeviceList />} />
        <Route path="/devices/:id" element={<DeviceDetail />} />
        <Route path="/devices/:id/settings" element={<DeviceSettings />} />
        <Route path="/alerts" element={<AlertsPage />} />
      </Routes>
    </Layout>
  );
}
