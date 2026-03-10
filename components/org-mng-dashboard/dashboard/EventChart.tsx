'use client';

import { MdBarChart } from 'react-icons/md';

interface EventChartProps {
  data?: {
    month: string;
    hostCount: number;
    eventCount: number;
    volunteerCount: number;
  }[];
}

const mockData = [
  { month: '1', hostCount: 350, eventCount: 280, volunteerCount: 420 },
  { month: '2', hostCount: 280, eventCount: 220, volunteerCount: 350 },
  { month: '3', hostCount: 350, eventCount: 280, volunteerCount: 450 },
  { month: '4', hostCount: 250, eventCount: 200, volunteerCount: 320 },
  { month: '5', hostCount: 520, eventCount: 420, volunteerCount: 640 },
  { month: '6', hostCount: 450, eventCount: 360, volunteerCount: 580 },
  { month: '7', hostCount: 650, eventCount: 520, volunteerCount: 780 },
  { month: '8', hostCount: 380, eventCount: 300, volunteerCount: 460 },
  { month: '9', hostCount: 780, eventCount: 620, volunteerCount: 920 },
  { month: '10', hostCount: 550, eventCount: 440, volunteerCount: 680 },
  { month: '11', hostCount: 850, eventCount: 680, volunteerCount: 980 },
  { month: '12', hostCount: 700, eventCount: 560, volunteerCount: 840 },
];

export default function EventChart({ data = mockData }: EventChartProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.hostCount, d.eventCount, d.volunteerCount]));
  const scaleHeight = 300;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-[#E3F2FD] dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
            Sự kiện & Host theo tháng
          </h3>
        </div>
      </div>

      {/* Chart */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400 w-12">
          <span>1000</span>
          <span>750</span>
          <span>500</span>
          <span>250</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="ml-12 pb-8">
          <div className="flex items-end justify-between gap-2 h-[300px] border-b border-gray-200 dark:border-gray-700">
            {data.map((item, index) => (
              <div 
                key={index}
                className="flex-1 flex items-end justify-center gap-0.5"
              >
                {/* Host bar */}
                <div 
                  className="w-full bg-[#42A5F5] rounded-t hover:bg-[#64B5F6] transition-colors cursor-pointer relative group"
                  style={{ 
                    height: `${(item.hostCount / maxValue) * scaleHeight}px`,
                    minHeight: '4px'
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Host: {item.hostCount}
                  </div>
                </div>
                {/* Event bar */}
                <div 
                  className="w-full bg-[#90CAF9] rounded-t hover:bg-[#BBDEFB] transition-colors cursor-pointer relative group"
                  style={{ 
                    height: `${(item.eventCount / maxValue) * scaleHeight}px`,
                    minHeight: '4px'
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Sự kiện: {item.eventCount}
                  </div>
                </div>
                {/* Volunteer bar */}
                <div 
                  className="w-full bg-[#81D4FA] rounded-t hover:bg-[#B3E5FC] transition-colors cursor-pointer relative group"
                  style={{ 
                    height: `${(item.volunteerCount / maxValue) * scaleHeight}px`,
                    minHeight: '4px'
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap z-10">
                    Volunteer: {item.volunteerCount}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="flex items-center justify-between mt-2">
            {data.map((item, index) => (
              <div key={index} className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">
                {item.month}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#42A5F5]"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Tổng số Host</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#90CAF9]"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Tổng số Sự kiện</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#81D4FA]"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Tổng số Volunteer</span>
          </div>
        </div>
      </div>
    </div>
  );
}
