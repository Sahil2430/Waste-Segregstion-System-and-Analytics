rules_version = '2';
service cloud.firestore {
match /databases/{database}/documents {
// Allow read/write access to the public wasteLog collection for any authenticated user.
// This is suitable for a public demo application.
// For a production app, you might want more restrictive rules.
match /artifacts/{appId}/public/data/wasteLog/{logId} {
allow read, write: if request.auth != null;
}
}
}