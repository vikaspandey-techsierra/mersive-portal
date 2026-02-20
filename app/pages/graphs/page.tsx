import PieChartComponent from "@/components/PieChartComponent";
import BarChartComponent from "@/components/BarChartComponent";
import AreaChartComponent from "@/components/AreaChartComponent";
import DonutChartComponent from "@/components/DonutChartComponent";
import RadarChartComponent from "@/components/RadarChartComponent";
import MultiLineChart from "@/components/MultiLineChart";
import DualAxisChart from "@/components/DualAxisChart";
import StackedBarChart from "@/components/StackedBarChart";
import ComposedChartComponent from "@/components/ComposedChartComponent";
import ZoomChart from "@/components/ZoomChart";
import SalesChart from "@/components/SalesChart";
import VotingDashboard from "@/components/VotingChartComponent";
import AnalyticsPage from "@/components/analyticsPage";
import Card from "@/components/Card";
import DeviceTypeDonut from "@/components/DeviceTypeDonut";
import DeviceStatusPie from "@/components/DeviceStatusPie";
import PlanTypePie from "@/components/PlanTypePie";
import FleetHealthGauge from "@/components/FleetHealthGauge";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8 text-black">
      <h1 className="text-3xl font-bold mb-8">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <PieChartComponent />
        <DonutChartComponent />
        <BarChartComponent />
        <AreaChartComponent />
        <RadarChartComponent />
        <MultiLineChart />
        <DualAxisChart />
        <StackedBarChart />
        <ComposedChartComponent />
        <ZoomChart />
        <SalesChart />
        {/* <VotingPieChart data={} /> */}
        <VotingDashboard />
        <AnalyticsPage />
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
