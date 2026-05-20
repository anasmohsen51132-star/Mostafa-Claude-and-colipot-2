import { prisma } from "../../lib/prisma";

export const createCourse = (data: any) => prisma.course.create({ data });

export const findCourseBySlug = (slug: string) =>
  prisma.course.findUnique({ where: { slug } });

export const listCourses = (skip: number, take: number) =>
  prisma.course.findMany({ skip, take, where: { deletedAt: null } });
