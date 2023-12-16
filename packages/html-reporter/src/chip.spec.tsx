import { expect, test } from '@playwright/experimental-ct-react';
import { AutoChip, Chip as LocalChip } from './chip';

test.use({ viewport: { width: 500, height: 500 } });

test('expand collapse', async ({ mount }) => {
  const component = await mount(<AutoChip header='title'>
    Chip body
  </AutoChip>);
  await expect(component.getByText('Chip body')).toBeVisible();
  await component.getByText('Title').click();
  await expect(component.getByText('Chip body')).not.toBeVisible();
  await component.getByText('Title').click();
  await expect(component.getByText('Chip body')).toBeVisible();
});

test('render long title', async ({ mount }) => {
  const title = 'Extremely long title. '.repeat(10);
  const component = await mount(<AutoChip header={title}>
    Chip body
  </AutoChip>);
  await expect(component).toContainText('Extremely long title.');
  await expect(component.getByText('Extremely long title.')).toHaveAttribute('title', title);
});

test('setExpanded is called', async ({ mount }) => {
  const expandedValues: boolean[] = [];
  const component = await mount(<LocalChip header='Title'
    setExpanded={(expanded: boolean) => expandedValues.push(expanded)}>
  </LocalChip>);

  await component.getByText('Title').click();
  expect(expandedValues).toEqual([true]);
});
