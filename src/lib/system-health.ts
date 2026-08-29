export type HealthDependencyStatus = 'ready' | 'unready';

export type ReadinessDetails = {
  status: 'ready' | 'unready';
  checkedAt: string;
  dependencies: {
    database: HealthDependencyStatus;
    objectStorage: HealthDependencyStatus;
  };
};

export type SystemHealthState = 'healthy' | 'degraded' | 'unready' | 'unreachable';

function isDependencyStatus(value: unknown): value is HealthDependencyStatus {
  return value === 'ready' || value === 'unready';
}

export function parseReadinessDetails(value: unknown): ReadinessDetails | null {
  if (!value || typeof value !== 'object') return null;
  const record = value as Record<string, unknown>;
  const dependencies = record.dependencies;
  if (!dependencies || typeof dependencies !== 'object') return null;
  const dependencyRecord = dependencies as Record<string, unknown>;

  if (
    (record.status !== 'ready' && record.status !== 'unready') ||
    typeof record.checkedAt !== 'string' ||
    !isDependencyStatus(dependencyRecord.database) ||
    !isDependencyStatus(dependencyRecord.objectStorage)
  ) {
    return null;
  }

  return {
    status: record.status,
    checkedAt: record.checkedAt,
    dependencies: {
      database: dependencyRecord.database,
      objectStorage: dependencyRecord.objectStorage,
    },
  };
}

export function mapSystemHealthState(details: ReadinessDetails | null): SystemHealthState {
  if (!details) return 'unreachable';

  const readyCount = Object.values(details.dependencies).filter(status => status === 'ready').length;
  if (details.status === 'ready' && readyCount === 2) return 'healthy';
  if (readyCount > 0) return 'degraded';
  return 'unready';
}
