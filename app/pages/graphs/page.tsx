import Card from "@/components/Card";
import DeviceTypeDonut from "@/components/DeviceTypeDonut";
import DeviceStatusPie from "@/components/DeviceStatusPie";
import PlanTypePie from "@/components/PlanTypePie";
import FleetHealthGauge from "@/components/FleetHealthGauge";
import AnalyticsGraphPage from "@/components/analyticsPage";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <AnalyticsGraphPage />
      </div>
      <main className="p-10 bg-gray-50 min-h-screen">
        <h1 className="text-2xl font-semibold mb-6">
          Device Breakdown as of Dec 23, 2025 at 3:40 PM
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Device Type">
            <DeviceTypeDonut />
          </Card>

          <Card title="Device Status">
            <DeviceStatusPie />
          </Card>

          <Card title="Plan Type">
            <PlanTypePie />
          </Card>

          <Card title="Overall Fleet Health">
            <FleetHealthGauge />
          </Card>
        </div>
      </main>
    </main>
  );
}
