import React from 'react';
import { DiscoveryScreen } from '../../src/evercircle/social/DiscoveryScreen';
import { FeatureBoundary } from '../../src/evercircle/FeaturePage';
import { LegacyFriendsContent } from '../../src/her/Screens';
export default function Friends(){return <FeatureBoundary><DiscoveryScreen><LegacyFriendsContent/></DiscoveryScreen></FeatureBoundary>;}
