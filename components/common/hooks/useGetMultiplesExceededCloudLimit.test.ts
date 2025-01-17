// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {limitThresholds, LimitTypes} from 'utils/limits';
import {FileSizes} from 'utils/file_utils';

import useGetMultiplesExceededCloudLimit, {LimitSummary} from './useGetMultiplesExceededCloudLimit';

jest.mock('react', () => ({
    useMemo: (fn: () => LimitSummary) => fn(),
}));

const zeroUsage = {
    files: {
        totalStorage: 0,
        totalStorageLoaded: true,
    },
    messages: {
        history: 0,
        historyLoaded: true,
    },
    boards: {
        cards: 0,
        cardsLoaded: true,
    },
    integrations: {
        enabled: 0,
        enabledLoaded: true,
    },
    teams: {
        active: 0,
        cloudArchived: 0,
        teamsLoaded: true,
    },
};

describe('useGetHighestThresholdCloudLimit', () => {
    const messageHistoryLimit = 10000;
    const filesLimit = FileSizes.Gigabyte * 10;
    const boardsLimit = 5;
    const integrationsLimit = 5;
    const exceededMessageUsage = Math.ceil((limitThresholds.exceeded / 100) * messageHistoryLimit) + 1;

    const tests = [
        {
            label: 'reports no limits surpassed',
            limits: {},
            usage: zeroUsage,
            expected: [],
        },
        {
            label: 'reports messages limit surpasded',
            limits: {
                messages: {
                    history: messageHistoryLimit,
                },
            },
            usage: {
                ...zeroUsage,
                messages: {
                    ...zeroUsage.messages,
                    history: exceededMessageUsage,
                },
            },
            expected: [LimitTypes.messageHistory],
        },
        {
            label: 'reports files limit surpassed',
            limits: {
                files: {
                    total_storage: filesLimit,
                },
            },
            usage: {
                ...zeroUsage,
                files: {
                    ...zeroUsage.files,
                    totalStorage: FileSizes.Gigabyte * 2 * 10,
                },
            },
            expected: [LimitTypes.fileStorage],
        },
        {
            label: 'reports boards limit surpassed',
            limits: {
                boards: {
                    cards: boardsLimit,
                },
            },
            usage: {
                ...zeroUsage,
                boards: {
                    ...zeroUsage.boards,
                    cards: boardsLimit + 1,
                },
            },
            expected: [LimitTypes.boardsCards],
        },
        {
            label: 'reports integrations limit surpassed',
            limits: {
                integrations: {
                    enabled: integrationsLimit,
                },
            },
            usage: {
                ...zeroUsage,
                integrations: {
                    ...zeroUsage.integrations,
                    enabled: integrationsLimit + 1,
                },
            },
            expected: [LimitTypes.enabledIntegrations],
        },
        {
            label: 'reports messages and files limit surpasded',
            limits: {
                messages: {
                    history: messageHistoryLimit,
                },
                files: {
                    total_storage: filesLimit,
                },
            },
            usage: {
                ...zeroUsage,
                messages: {
                    ...zeroUsage.messages,
                    history: exceededMessageUsage,
                },
                files: {
                    ...zeroUsage.files,
                    totalStorage: FileSizes.Gigabyte * 2 * 10,
                },
            },
            expected: [LimitTypes.messageHistory, LimitTypes.fileStorage],
        },
    ];

    tests.forEach((t: typeof tests[0]) => {
        test(t.label, () => {
            const actual = useGetMultiplesExceededCloudLimit(t.usage, t.limits);
            expect(t.expected).toEqual(actual);
        });
    });
});
