import type { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import CopilotWidget from '../copilot/CopilotWidget';

export default function AppLayout({
  title,
  children,
  hideCopilotWidget = false,
}: {
  title: string;
  children: ReactNode;
  hideCopilotWidget?: boolean;
}) {
  return (
    <div className="flex min-h-screen bg-transparent">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <Navbar title={title} />
        <main className="flex-1 p-4 md:p-6 max-w-[1600px] w-full mx-auto">{children}</main>
      </div>
      {!hideCopilotWidget && <CopilotWidget />}
    </div>
  );
}
