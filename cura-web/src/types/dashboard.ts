export type WidgetKey =
  | 'residents' | 'alerts' | 'staff' | 'occupancy'
  | 'schedule' | 'careplans' | 'medications' | 'incidents';

export interface DashboardLayout {
  widgets: WidgetKey[];
}

export const DEFAULT_LAYOUT: DashboardLayout = {
  widgets: ['residents', 'alerts', 'staff', 'occupancy', 'schedule', 'careplans', 'medications', 'incidents'],
};
