/*eslint-disable*/
'use client';

import MainChart from '@/components/dashboard/main/cards/MainChart';
import MainDashboardTable from '@/components/dashboard/main/cards/MainDashboardTable';
import DashboardLayout from '@/components/layout';
import tableDataUserReports from '@/variables/tableDataUserReports';
import { User } from '@supabase/supabase-js';
import type { IRoute } from '@/types/types';
interface Props {
  user: User | null | undefined;
  userDetails: { [x: string]: any } | null | any;
  title?: string;
  description?: string;
  routes?: IRoute[];
  colorVariant?: 'admin' | 'organizer';
  signInPath?: string;
}

export default function Settings(props: Props) {
  return (
    <DashboardLayout
      user={props.user}
      userDetails={props.userDetails}
      title={props.title ?? 'Trang đăng ký'}
      description={props.description ?? 'Quản lý gói đăng ký'}
      routes={props.routes}
      colorVariant={props.colorVariant}
      signInPath={props.signInPath}
    >
      <div className="h-full w-full">
        <div className="mb-5 flex gap-5 flex-col xl:flex-row w-full">
          <MainChart />
        </div>
        {/* Conversion and talbes*/}
        <div className="h-full w-full rounded-lg ">
          <MainDashboardTable tableData={tableDataUserReports} />
        </div>
      </div>
    </DashboardLayout>
  );
}
