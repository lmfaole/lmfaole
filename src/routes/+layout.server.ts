import { Octokit } from 'octokit';
import { GITHUB_TOKEN } from '$env/static/private';

export const load = async () => {
	const octokit = new Octokit({
		auth: GITHUB_TOKEN
	});

	const repo = await octokit.request('GET /repos/{owner}/{repo}', {
		owner: 'lmfaole',
		repo: 'lmfaole',
		headers: {
			'X-GitHub-Api-Version': '2022-11-28'
		}
	});

	const user = await octokit.request('GET /users/{username}', {
		username: 'lmfaole',
		headers: {
			'X-GitHub-Api-Version': '2022-11-28'
		}
	});

	return { repo: repo.data, user: user.data };
};