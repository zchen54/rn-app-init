//
//  RNBridgeManager.m
//  LCP
//
//  Created by Allsworth on 2020/3/25.
//  Copyright © 2020 Facebook. All rights reserved.
//

#import "RNBridgeManager.h"
@implementation RNBridgeManager

@synthesize bridge = _bridge;

RCT_EXPORT_MODULE(ToolModule);
//  对外提供调用方法,Callback
RCT_EXPORT_METHOD(getAppVersion:(RCTResponseSenderBlock)callback)
{
  NSString *versionName = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleShortVersionString"];
  NSString *versionCode = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleVersion"];
  NSString *bundleId = [[[NSBundle mainBundle] infoDictionary] objectForKey:@"CFBundleIdentifier"];
  
  callback(@[[NSNull null],versionName,versionCode,bundleId]);
}

@end
