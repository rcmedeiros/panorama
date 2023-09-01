import { OneDriveItem } from './one_drive_item';

export interface OneDriveDelta {
  '@odata.context': string;
  '@odata.deltaLink': string;
  '@odata.nextLink': string;
  value: Array<OneDriveItem>;
}
