"use client";

import { useState } from "react";
import { Pagination } from "@sagui/ui";

// #region Hero
export function Hero() {
  const [page, setPage] = useState(5);
  return <Pagination className="w-full" page={page} pageCount={25} onPageChange={setPage} summary={`Showing ${(page - 1) * 10 + 1}–${page * 10} of 248`} />;
}
// #endregion

// #region Compact
export function Compact() {
  const [page, setPage] = useState(3);
  return <Pagination className="w-full max-w-sm" layout="compact" page={page} pageCount={25} onPageChange={setPage} />;
}
// #endregion
