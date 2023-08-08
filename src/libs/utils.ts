import clsx, { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export const twclsx = (...args: ClassValue[]) => twMerge(clsx(...args));

export const sortByCreationDateFnUp = (a: { create_date: number }, b: { create_date: number }) => {
  if (a.create_date === b.create_date) {
    return 0;
  } else {
    return a.create_date < b.create_date ? -1 : 1;
  }
};

export const sortByDisplayNameFnUp = (a: { display_name: number }, b: { display_name: number }) => {
  if (a.display_name === b.display_name) {
    return 0;
  } else {
    return a.display_name < b.display_name ? -1 : 1;
  }
};

export const sortByUpdateDateFnUp = (a: { update_date: number }, b: { update_date: number }) => {
  if (a.update_date === b.update_date) {
    return 0;
  } else {
    return a.update_date < b.update_date ? -1 : 1;
  }
};

export const sortByCreationDateFnDown = (a: { create_date: number }, b: { create_date: number }) => {
  if (a.create_date === b.create_date) {
    return 0;
  } else {
    return a.create_date > b.create_date ? -1 : 1;
  }
};

export const sortByDisplayNameFnDown = (a: { display_name: number }, b: { display_name: number }) => {
  if (a.display_name === b.display_name) {
    return 0;
  } else {
    return a.display_name > b.display_name ? -1 : 1;
  }
};

export const sortByUpdateDateFnDown = (a: { update_date: number }, b: { update_date: number }) => {
  if (a.update_date === b.update_date) {
    return 0;
  } else {
    return a.update_date > b.update_date ? -1 : 1;
  }
};

export const makeName = (name: any, list: any[], index: number): any => {
  const filtered = list.filter((v: { display_name: string }) => {
    return v.display_name == `${name}${index}`;
  });
  if (filtered.length > 0) {
    return makeName(name, list, index + 1);
  } else {
    return name + index;
  }
};

// eslint-disable-next-line no-useless-escape
export const special_pattern = /[!?@#$%^&*():;+-=~{}<>\_\[\]\|\\\"\'\,\.\/\`\₩]/;
// export const special_pattern = /[~!@#$%^&*_+|<>?:{}.`₩]\]/
export const special_pattern_num = /[0-9]/;

const ANTI_PATTERN = [
  '!',
  '?',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '_',
  '=',
  '+',
  '|',
  '\\',
  '₩',
  '`',
  `'`,
  `"`,
  `<`,
  `>`,
  ';',
  ':',
  '/',
  '.',
];

export const getIncludes = (str: string | string[]) => {
  for (let i = 0; i < ANTI_PATTERN.length; i++) {
    if (str.includes(ANTI_PATTERN[i])) return true;
  }
  return false;
};
