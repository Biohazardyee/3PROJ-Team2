# API Endpoints

This document lists all available endpoints in the backend, grouped by route file and specifying the HTTP method for each.

---

## activities
- **POST** `/activities` — Add activity
- **GET** `/activities` — Get all activities
- **GET** `/activities/:id` — Get activity by ID
- **GET** `/activities/feed/:user_id` — Get activity feed for user
- **DELETE** `/activities/:id` — Delete activity

## ban.users
- **POST** `/ban.users` — Ban a user
- **GET** `/ban.users` — Get all banned users
- **GET** `/ban.users/:user_id` — Get ban info for user
- **PUT** `/ban.users/:id` — Update ban info

## follows
- **POST** `/follows` — Follow a user
- **DELETE** `/follows` — Unfollow a user
- **GET** `/follows/followers/:user_id` — Get followers
- **GET** `/follows/following/:user_id` — Get following

## medias
- **POST** `/medias` — Add media
- **GET** `/medias/:id` — Get media by ID
- **GET** `/medias` — Get all media
- **PUT** `/medias/:id` — Update media
- **DELETE** `/medias/:id` — Delete media
- **GET** `/medias/status/:user_id/:media_id` — Get media status
- **POST** `/medias/status` — Add media status
- **PUT** `/medias/status/:user_id/:media_id` — Update media status
- **DELETE** `/medias/status/:user_id/:media_id` — Delete media status

## notifications
- **POST** `/notifications` — Add notification
- **GET** `/notifications` — Get all notifications
- **GET** `/notifications/:id` — Get notification by ID
- **GET** `/notifications/user/:user_id` — Get notifications for user
- **PATCH** `/notifications/:id/read` — Mark notification as read
- **DELETE** `/notifications/:id` — Delete notification

## playlists
- **POST** `/playlists` — Create playlist
- **GET** `/playlists/user/:user_id` — Get playlists for user
- **GET** `/playlists/:id` — Get playlist by ID
- **PUT** `/playlists/:playlist_id` — Update playlist
- **GET** `/playlists` — Get all playlists
- **DELETE** `/playlists/:id` — Delete playlist

## playlists.items
- **POST** `/playlists-items` — Add item to playlist
- **GET** `/playlists-items` — Get all playlist items
- **GET** `/playlists-items/:id` — Get playlist item by ID
- **GET** `/playlists-items/:playlist_id` — Get items by playlist ID
- **DELETE** `/playlists-items/:id` — Delete playlist item

## reports
- **POST** `/reports` — Add report
- **GET** `/reports` — Get all reports
- **GET** `/reports/:id` — Get report by ID
- **GET** `/reports/review/:review_id` — Get reports for review
- **PATCH** `/reports/:id/check` — Update report status
- **DELETE** `/reports/:id` — Delete report

## reviews
- **POST** `/reviews` — Add review
- **POST** `/reviews/likes` — Like a review
- **GET** `/reviews` — Get all reviews
- **GET** `/reviews/likes` — Get all review likes
- **GET** `/reviews/:id` — Get review by ID
- **GET** `/reviews/likes/:review_id/:user_id` — Get like status for review/user
- **PUT** `/reviews/:id` — Update review
- **DELETE** `/reviews/:id` — Delete review
- **DELETE** `/reviews/likes/:review_id/:user_id` — Remove like from review

## users
- **POST** `/users/signin` — Sign in
- **POST** `/users/login` — Log in
- **PUT** `/users/:id` — Update user
- **DELETE** `/users/:id` — Delete user
- **GET** `/users` — Get all users
- **GET** `/users/:id` — Get user by ID

## index
- **GET** `/` — Home

---

> **Note:** Replace route prefixes as needed based on your API base path configuration.
