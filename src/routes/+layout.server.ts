import { Octokit } from '@octokit/core';
import type { LayoutServerLoad } from './$types';
import { GITHUB_USER } from '$env/static/private';

const octokit = new Octokit({
	auth: GITHUB_USER
})

export const load: LayoutServerLoad = async () => {
	const userInfo = await octokit.request('GET /user', {
		headers: {
			'X-GitHub-Api-Version': '2022-11-28'
		}
	})

	return {
		user: userInfo.data
	}
};