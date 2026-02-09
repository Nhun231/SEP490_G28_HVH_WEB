'use client';

import { MdBarChart } from 'react-icons/md';

interface EventChartProps {
  data?: {
    month: string;
    hostCount: number;
    eventCount: number;
  }[];
}

const mockData = [
  { month: '1/1', hostCount: 350, eventCount: 280 },
  { month: '1/1', hostCount: 280, eventCount: 220 },
  { month: '1/2', hostCount: 350, eventCount: 280 },
  { month: '1/2', hostCount: 250, eventCount: 200 },
  { month: '1/3', hostCount: 520, eventCount: 420 },
  { month: '1/3', hostCount: 450, eventCount: 360 },
  { month: '7/4', hostCount: 650, eventCount: 520 },
  { month: '7/4', hostCount: 380, eventCount: 300 },
  { month: '7/5', hostCount: 780, eventCount: 620 },
  { month: '7/5', hostCount: 550, eventCount: 440 },
  { month: '7/6', hostCount: 850, eventCount: 680 },
  { month: '7/6', hostCount: 700, eventCount: 560 },
];

export default function EventChart({ data = mockData }: EventChartProps) {
  const maxValue = Math.max(...data.flatMap(d => [d.hostCount, d.eventCount]));
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
                className="flex-1 flex items-end justify-center gap-1"
              >
                {/* Host bar */}
                <div 
                  className="w-full bg-[#42A5F5] rounded-t hover:bg-[#64B5F6] transition-colors cursor-pointer relative group"
                  style={{ 
                    height: `${(item.hostCount / maxValue) * scaleHeight}px`,
                    minHeight: '4px'
                  }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
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
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Sự kiện: {item.eventCount}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* X-axis labels */}
          <div className="flex items-center justify-between mt-2">
            {['1/1', '1/1', '1/2', '1/2', '1/3', '1/3', '7/4', '7/4', '7/5', '7/5', '7/6', '7/6'].map((label, index) => (
              <div key={index} className="flex-1 text-center text-xs text-gray-500 dark:text-gray-400">
                {index % 2 === 0 ? label : ''}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#42A5F5]"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Host tổng hợp</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#90CAF9]"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Sự kiện</span>
          </div>
        </div>
      </div>
    </div>
  );
}
