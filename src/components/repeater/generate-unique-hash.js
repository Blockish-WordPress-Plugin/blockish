export default function generateUniqueHash() {
    const now = Date.now().toString(36); // Convert the current timestamp to a base-36 string
    const randomValue = Math.random().toString(36).substring(2, 8); // Generate a random string

    // Combine the timestamp and random string and take the first 6 characters
    const hash = (now + randomValue).substring(0, 8);

    return hash;
}
