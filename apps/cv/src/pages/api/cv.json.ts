// `/cv/api/cv.json`: the CV as data, the same snapshot the page is built from.
import type { APIRoute } from 'astro'

import data from '../../data/cv.json'

export const prerender = true

export const GET: APIRoute = () => Response.json(data)
