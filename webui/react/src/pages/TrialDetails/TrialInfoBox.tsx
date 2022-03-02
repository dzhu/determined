import React, { useCallback, useMemo, useState } from 'react';

import CheckpointModal from 'components/CheckpointModal';
import Grid, { GridMode } from 'components/Grid';
import OverviewStats from 'components/OverviewStats';
import Section from 'components/Section';
import TimeAgo from 'components/TimeAgo';
import { ShirtSize } from 'themes';
import { CheckpointDetail, ExperimentBase, TrialDetails } from 'types';
import { humanReadableBytes } from 'utils/string';

interface Props {
  experiment: ExperimentBase;
  trial: TrialDetails;
}

const TrialInfoBox: React.FC<Props> = ({ experiment, trial }: Props) => {
  const [ showBestCheckpoint, setShowBestCheckpoint ] = useState(false);

  const bestCheckpoint: CheckpointDetail | undefined = useMemo(() => {
    const cp = trial.bestAvailableCheckpoint;
    if (!cp) return;

    return {
      ...cp,
      batch: cp.totalBatches,
      experimentId: trial.experimentId,
      trialId: trial.id,
    };
  }, [ trial.bestAvailableCheckpoint, trial.experimentId, trial.id ]);

  const handleShowBestCheckpoint = useCallback(() => setShowBestCheckpoint(true), []);
  const handleHideBestCheckpoint = useCallback(() => setShowBestCheckpoint(false), []);

  return (
    <Section>
      <Grid gap={ShirtSize.medium} minItemWidth={180} mode={GridMode.AutoFill}>
        {trial.runnerState && (
          <OverviewStats title="Last Runner State">
            {trial.runnerState}
          </OverviewStats>
        )}
        <OverviewStats title="Start Time">
          <TimeAgo datetime={trial.startTime} />
        </OverviewStats>
        {trial.totalCheckpointSize && (
          <OverviewStats title="Total Checkpoint Size">
            {humanReadableBytes(trial.totalCheckpointSize)}
          </OverviewStats>
        )}
        {bestCheckpoint && (
          <OverviewStats title="Best Checkpoint" onClick={handleShowBestCheckpoint}>
            Batch {bestCheckpoint.batch}
          </OverviewStats>
        )}
      </Grid>
      {bestCheckpoint && (
        <CheckpointModal
          checkpoint={bestCheckpoint}
          config={experiment.config}
          show={showBestCheckpoint}
          title={`Best Checkpoint for Trial ${trial.id}`}
          onHide={handleHideBestCheckpoint}
        />
      )}
    </Section>
  );
};

export default TrialInfoBox;
