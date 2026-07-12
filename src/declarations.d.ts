// Type declarations for missing navigation modules
declare module '@react-navigation/native-stack' {
  import { NavigationContainerRef, StackNavigationProp } from '@react-navigation/native';
  import React from 'react';
  
  export type NativeStackScreenProps<ParamList extends Record<string, any>, RouteName extends keyof ParamList = keyof ParamList> = {
    navigation: StackNavigationProp<ParamList, RouteName>;
    route: {
      name: RouteName;
      params: ParamList[RouteName];
    };
  };
  
  export function createNativeStackNavigator<ParamList extends Record<string, any>>(): {
    Navigator: React.ComponentType<{
      screenOptions?: any;
      children: React.ReactNode;
    }>;
    Screen: React.ComponentType<{
      name: keyof ParamList;
      component: React.ComponentType<any>;
      options?: any;
    }>;
  };
}

declare module '@react-navigation/bottom-tabs' {
  import { BottomTabNavigationProp } from '@react-navigation/native';
  import React from 'react';
  
  export type BottomTabScreenProps<ParamList extends Record<string, any>, RouteName extends keyof ParamList = keyof ParamList> = {
    navigation: BottomTabNavigationProp<ParamList, RouteName>;
    route: {
      name: RouteName;
      params: ParamList[RouteName];
    };
  };
  
  export function createBottomTabNavigator<ParamList extends Record<string, any>>(): {
    Navigator: React.ComponentType<{
      screenOptions?: any;
      children: React.ReactNode;
    }>;
    Screen: React.ComponentType<{
      name: keyof ParamList;
      component: React.ComponentType<any>;
      options?: any;
    }>;
  };
}