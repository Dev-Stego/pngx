# How to Add Your Admin Wallet

Since the `admins` collection is normally write-protected for security, you cannot just "sign up" as an admin.

However, I have enabled a **Temporary Setup Flow** for you.

## Instructions

1.  Navigate to **[http://localhost:3000/admin-login](http://localhost:3000/admin-login)**.
2.  Connect your wallet.
3.  You will see an "Access Denied" message (expected, as you are not in the database yet).
4.  Below that, you will see a temporary orange button: **⚠️ Setup First Admin**.
5.  Click it.
6.  This will create your admin record in Firestore and redirect you to the dashboard.

> **Note:** Once you have claimed admin access, you should theoretically revert the `firestore.rules` change to lock it down again, but for this development session, you can leave it as is or ask me to "Lock down admin creation" when you are done.
