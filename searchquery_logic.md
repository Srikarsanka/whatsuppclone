# WhatsApp Clone: Search & Friend Toggle Logic

This document explains the end-to-end logic of how the search functionality works, how users are matched, and how the "Add/Remove Friend" toggle functions on the frontend and backend.

## 1. The Backend Search Logic

When a user types into the search bar, the frontend sends a `GET` request to the backend route: `/api/user/search/:searchTerm`.

### `searchuser.js` Controller
```javascript
const User = require("../../model/loginschema")

const searchUser = async (req, res) => {
      try {
            const loginUserID = req.user.id
            const searchTerm = req.params.searchTerm

            // 1. Partial Search Matching using $regex
            const foundUsers = await User.find({
                  $or: [
                        { username: { $regex: searchTerm, $options: "i" } },
                        { email: { $regex: searchTerm, $options: "i" } },
                        { phone: { $regex: searchTerm, $options: "i" } }
                  ]
            })

            if (!foundUsers || foundUsers.length === 0) {
                  return res.status(404).json({ message: "No user found" })
            }

            const me = await User.findById(loginUserID)
            const result = []

            for (let i = 0; i < foundUsers.length; i++) {
                  const u = foundUsers[i]

                  // 2. Prevent the user from seeing themselves in the results
                  if (u._id.toString() === loginUserID) {
                        continue
                  }

                  // 3. Determine if the matched user is already a friend
                  const isFriend = me.friends.includes(u._id.toString())

                  // 4. Privacy: Only show username if they are friends, otherwise show phone
                  let displayName
                  if (isFriend) {
                        displayName = u.username
                  } else {
                        displayName = u.phone
                  }

                  // 5. Send back the packaged result
                  result.push({
                        _id: u._id,
                        displayName: displayName,
                        phone: u.phone,
                        isFriend: isFriend
                  })
            }

            if (result.length === 0) {
                  return res.status(404).json({ message: "No user found" })
            }

            return res.status(200).json(result)

      } catch (err) {
            return res.status(500).json({ message: "Internal server error while searching" })
      }
}
```
**How it works:**
* **$regex & $options: "i"**: This tells MongoDB to do a "partial match" that is case-insensitive. If a user's name is "Abhiram", typing just "A" or "abhi" will find them.
* **isFriend**: The backend checks your personal `friends` array to see if the found user is in it. It attaches `isFriend: true` or `isFriend: false` to the response so the frontend knows what color heart to show.

---

## 2. The Frontend Search Handling

When you type in the search bar, the `onChange` event fires this function:

### `handleSearchQueryChange` (in `ChatInterface.jsx`)
```javascript
      const handleSearchQueryChange = async (e) => {
            const query = e.target.value;
            setSearchQuery(query);

            // If the search bar is empty, clear the results
            if (!query.trim()) {
                  setSearchResults([]);
                  return;
            }

            // Fetch the matched users from the backend
            try {
                  const response = await axios.get(`http://localhost:3000/api/user/search/${query}`, { withCredentials: true });
                  setSearchResults(response.data);
            } catch (err) {
                  setSearchResults([]);
            }
      }
```
**How it works:**
* It takes what you typed and sends it to the backend.
* It uses `{ withCredentials: true }` so the browser sends your JWT token cookie to prove you are logged in.
* It saves the returned array into `searchResults`, which automatically re-renders the UI to show the contact rows.

---

## 3. The Optimistic "Add / Remove Friend" Toggle

When you click the heart icon next to a user, the `toggleLike` function is called.

### `toggleLike` (in `ChatInterface.jsx`)
```javascript
      const toggleLike = async (id, isCurrentlyFriend) => {
            // 1. Optimistic UI update: instantly flip the isFriend status visually
            setSearchResults(prev => prev.map(user => 
                  user._id === id ? { ...user, isFriend: !isCurrentlyFriend } : user
            ));

            if (!isCurrentlyFriend) {
                  // 2. Call backend to ADD them as a friend
                  try {
                        await axios.post(`http://localhost:3000/api/user/addfriend/${id}`, {}, { withCredentials: true });
                  } catch (err) {
                        console.error("Failed to add friend", err);
                        // Revert visual change if the API fails
                        setSearchResults(prev => prev.map(user => 
                              user._id === id ? { ...user, isFriend: isCurrentlyFriend } : user
                        ));
                  }
            } else {
                  // 3. Call backend to REMOVE them as a friend
                  try {
                        await axios.post(`http://localhost:3000/api/user/removefriend/${id}`, {}, { withCredentials: true });
                  } catch (err) {
                        console.error("Failed to remove friend", err);
                        // Revert visual change if the API fails
                        setSearchResults(prev => prev.map(user => 
                              user._id === id ? { ...user, isFriend: isCurrentlyFriend } : user
                        ));
                  }
            }
      }
```
**How it works:**
* **Optimistic UI:** Instead of waiting for the backend to respond (which takes milliseconds but can feel laggy on slow internet), it immediately maps over `searchResults` and flips `user.isFriend`. This makes the heart instantly turn red or white to the user.
* It then quietly makes the API call to the backend. If the API fails (e.g., server crash), the `catch` block catches the error and flips the heart back to its original state so the UI stays perfectly synced with the database.
