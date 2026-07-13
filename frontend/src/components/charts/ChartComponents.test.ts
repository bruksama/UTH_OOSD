import { describe, expect, it } from 'vitest';
import { getPieChartCellKey } from './ChartComponents';

describe('pie chart cell keys', () => {
    it('uses stable domain keys when labels are duplicated', () => {
        const duplicateLabels = [
            { key: 'normal-undergrad', name: 'Normal', value: 4 },
            { key: 'normal-postgrad', name: 'Normal', value: 2 },
        ];
        expect(duplicateLabels.map(getPieChartCellKey)).toEqual(['normal-undergrad', 'normal-postgrad']);
    });
});
