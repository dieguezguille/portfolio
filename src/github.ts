export default async function github(path: string) {
  const response = await fetch(`https://api.github.com/${path}`, {
    headers: {
      accept: "application/vnd.github+json",
      ...(process.env.GITHUB_TOKEN && { authorization: `Bearer ${process.env.GITHUB_TOKEN}` }),
    },
  });
  if (!response.ok) throw new Error(`github answered ${String(response.status)} to ${path}`);
  return response;
}
