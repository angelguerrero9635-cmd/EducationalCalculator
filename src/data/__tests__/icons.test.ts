import { courseIcon, iconFromTitle, problemTypeIcon, skillIcon, topicIcon } from '../icons';
import { getSkill, problemTypes } from '../selectors';
import { COURSES, SKILLS } from '../taxonomy';

describe('Browse box icons', () => {
  it('picks a picture that fits the title', () => {
    expect(iconFromTitle('Tell time to the hour and half hour')).toBe('clock');
    expect(iconFromTitle('Multiply and divide within 100')).toBe('times');
    expect(iconFromTitle('Area of rectangles (A = l × w)')).toBe('area');
    expect(iconFromTitle('Heavier and lighter')).toBe('balance');
    expect(iconFromTitle('Human Anatomy & Physiology')).toBe('heart');
    expect(iconFromTitle('Interference and diffraction')).toBe('wave');
    expect(iconFromTitle('Word problems')).toBe('book');
  });

  it('gives every skill, problem type, course and topic an icon', () => {
    for (const s of SKILLS) {
      expect(skillIcon(s)).toBeTruthy();
      for (const t of problemTypes(s.id))
        expect(problemTypeIcon(t.title, getSkill(s.id)!)).toBeTruthy();
    }
    for (const c of COURSES) {
      expect(courseIcon(c)).toBeTruthy();
      for (const t of c.topics) expect(topicIcon(t, c)).toBeTruthy();
    }
  });
});
