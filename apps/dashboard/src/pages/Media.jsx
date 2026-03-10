import React from 'react';
import MediaMetricsRow from '../components/media/MediaMetricsRow';
import FollowersGrowthChart from '../components/media/FollowersGrowthChart';
import EngagementBars from '../components/media/EngagementBars';
import ContentPipeline from '../components/media/ContentPipeline';
import AffiliateFunnel from '../components/media/AffiliateFunnel';

const Media = () => {
  return (
    <div className="space-y-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Media & Branding Panel</h1>
        <p className="text-slate-500">Real-time performance and ecosystem management</p>
      </div>
      
      <MediaMetricsRow />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <FollowersGrowthChart />
        <EngagementBars />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <ContentPipeline />
        <AffiliateFunnel />
      </div>
    </div>
  );
};

export default Media;
