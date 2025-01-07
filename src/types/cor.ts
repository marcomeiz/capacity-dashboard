export interface CORTask {
    id: number;
    title: string;
    project: {
      name: string;
      client: {
        name: string;
      }
    };
    status: string;
    datetime: string;
    deadline: string;
    hour_charged: number;
    estimated: number;
    pm: {
      first_name: string;
      last_name: string;
    };
    collaborators: Array<{
      first_name: string;
      last_name: string;
    }>;
  }

  export interface Task {
    id: number;
    title: string;
    clientName: string;
    projectName: string;
    status: string;
    startDate: Date;
    projectManager: string;
    collaborators: string[];
    hoursCharged: number;
    hoursEstimated: number;
    taskUrl: string;
  }