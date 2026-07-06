export interface Schedule {

  id: number;

  dayOfWeek: string;

  startTime: string;

  endTime: string;

  subject: {
    id: number;
    name: string;
  };

  group: {
    id: number;
    name: string;
  };

}