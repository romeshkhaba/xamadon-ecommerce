import * as ratingService from "../services/rating.service.js";

export async function getProductRatings(req, res) {
  const ratings = await ratingService.getProductRatings(req.params.productId);

  res.success(ratings, "Ratings retrieved successfully");
}

export async function getMyRatings(req, res) {
  const ratings = await ratingService.getMyRatings(req.user.id);

  res.success(ratings, "Your ratings retrieved successfully");
}

export async function createRating(req, res) {
  const rating = await ratingService.createRating(req.user.id, req.validatedData);

  res.success(rating, "Rating created successfully", 201);
}

export async function updateRating(req, res) {
  const rating = await ratingService.updateRating(
    req.user.id,
    req.params.ratingId,
    req.validatedData
  );

  res.success(rating, "Rating updated successfully");
}

export async function deleteRating(req, res) {
  const rating = await ratingService.deleteRating(req.user.id, req.params.ratingId);

  res.success(rating, "Rating deleted successfully");
}

export async function getAllRatings(req, res) {
  const ratings = await ratingService.getAllRatings();

  res.success(ratings, "Ratings retrieved successfully");
}

export async function adminUpdateRating(req, res) {
  const rating = await ratingService.adminUpdateRating(req.params.ratingId, req.validatedData);

  res.success(rating, "Rating updated successfully");
}

export async function adminDeleteRating(req, res) {
  const rating = await ratingService.adminDeleteRating(req.params.ratingId);

  res.success(rating, "Rating deleted successfully");
}
