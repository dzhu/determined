import React from 'react';

import {
  CheckpointState, ExperimentBase, ExperimentOld, RunState, TrialDetails, TrialItem, WorkloadGroup,
} from 'types';
import { generateOldExperiment } from 'utils/task';

import TrialInfoBox from './TrialInfoBox';

export default {
  component: TrialInfoBox,
  title: 'TrialInfoBox',
};

const sampleExperiment: ExperimentOld = generateOldExperiment(3);

const sampleTrialItem: TrialItem = {
  bestAvailableCheckpoint: {
    resources: { noOpCheckpoint: 1542 },
    state: CheckpointState.Completed,
    totalBatches: 10000,
  },
  experimentId: 1,
  hyperparameters: {
    boolVal: false,
    floatVale: 3.5,
    intVal: 3,
    objectVal: { paramA: 3, paramB: 'str' },
    stringVal: 'loss',
  },
  id: 1,
  startTime: Date.now.toString(),
  state: RunState.Completed,
  totalBatchesProcessed: 10000,
};

const sampleWorkloads: WorkloadGroup[] = [
  {
    validation: {
      endTime: '2021-06-09T15:28:20.278182Z',
      metrics: {
        accuracy: 0.9087380573248408,
        validation_loss: 0.29681510450970977,
      },
      totalBatches: 58,
    },
  },
  {
    checkpoint: {
      endTime: '2021-06-09T15:28:16.314554Z',
      resources: {
        'code/': 0,
        'code/adaptive.yaml': 678,
        'code/const.yaml': 434,
        'code/data.py': 1444,
        'code/distributed.yaml': 499,
        'code/layers.py': 568,
        'code/model_def.py': 3789,
        'code/README.md': 1407,
        'state_dict.pth': 13691537,
      },
      state: CheckpointState.Completed,
      totalBatches: 58,
      uuid: '08b7345e-1dd8-4ec2-a49c-054814d8929e',
    },
  },
  {
    training: {
      endTime: '2021-06-09T15:28:16.099435Z',
      metrics: { loss: 0.9266772866249084 },
      totalBatches: 58,
    },
  },
];

const experimentDetails: ExperimentBase = {
  ...sampleExperiment,
  username: 'hamid',
};

export const state = (): React.ReactNode => (
  <TrialInfoBox
    experiment={experimentDetails}
    trial={sampleTrialItem}
    workloads={sampleWorkloads}
  />
);
