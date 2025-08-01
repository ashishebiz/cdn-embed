export async function fetchData() {
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  return await response.json();
}
