import React from 'react';
import './Analysis.css';
import CategoryBreakdown from '../CategoryBreakdown/CategoryBreakdown';
import WeeklySpending from '../WeeklySpending/WeeklySpending';
import CasesHelpedPerDay from '../CasesHelpedPerDay/CasesHelpedPerDay';
import UserVsAverageSpending from '../UserVsAverageSpending/UserVsAverageSpending';
import UserHelpStatistics from '../UserHelpStatistics/UserHelpStatistics';
import MyOrders from '../MyOrders/MyOrders';

const Analysis = () => {
  return (
    <div className="analysis">
      <div >
        <main className="">
          
          {/* My Orders Table and Category Breakdown side by side */}
          <div className="flex flex-col lg:flex-row gap-8 mb-8">
            <div className="flex-1 flex">
              <MyOrders />
            </div>
            <div className="w-full lg:w-1/3 flex">
              <CategoryBreakdown />
            </div>
          </div>

          {/* Remaining three charts in a grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <CasesHelpedPerDay />
            <UserVsAverageSpending />
            <UserHelpStatistics/>
          </div>
          <WeeklySpending />

        </main>
      </div>
    </div>
  );
};

export default Analysis;
