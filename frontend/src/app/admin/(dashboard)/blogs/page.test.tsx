import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BlogsPage from "./page";

const mockUseAdminBlogs = vi.fn();
const mockUseDeleteBlog = vi.fn();
const mockMutateAsync = vi.fn();

vi.mock("@/hooks/use-blogs", () => ({
  useAdminBlogs: () => mockUseAdminBlogs(),
  useDeleteBlog: () => mockUseDeleteBlog(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

vi.mock("react-hot-toast", () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const blogs = [
  {
    id: "b1",
    title: "First Post",
    thumbnail: "https://example.com/1.jpg",
    status: "published",
    createdAt: "2026-01-01T00:00:00.000Z",
    author: { name: "Admin" },
  },
  {
    id: "b2",
    title: "Second Post",
    thumbnail: "https://example.com/2.jpg",
    status: "draft",
    createdAt: "2026-01-02T00:00:00.000Z",
    author: { name: "Admin" },
  },
];

describe("Admin blogs multi-select", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockMutateAsync.mockResolvedValue({});
    mockUseAdminBlogs.mockReturnValue({
      data: { blogs, pagination: { page: 1, limit: 10, total: 2, totalPages: 1 } },
      isLoading: false,
    });
    mockUseDeleteBlog.mockReturnValue({ mutateAsync: mockMutateAsync });
    // @ts-expect-error test setup
    window.confirm = vi.fn(() => true);
  });

  it("selects and deselects all rows", async () => {
    const user = userEvent.setup();
    render(<BlogsPage />);

    const selectAll = screen.getByLabelText("Select all blogs");
    await user.click(selectAll);

    expect((screen.getByLabelText("Select blog First Post") as HTMLInputElement).checked).toBe(true);
    expect((screen.getByLabelText("Select blog Second Post") as HTMLInputElement).checked).toBe(true);

    await user.click(selectAll);
    expect((screen.getByLabelText("Select blog First Post") as HTMLInputElement).checked).toBe(false);
    expect((screen.getByLabelText("Select blog Second Post") as HTMLInputElement).checked).toBe(false);
  });

  it("deletes selected blogs in bulk", async () => {
    const user = userEvent.setup();
    render(<BlogsPage />);

    await user.click(screen.getByLabelText("Select blog First Post"));
    await user.click(screen.getByLabelText("Select blog Second Post"));

    await user.click(screen.getByRole("button", { name: "Delete selected" }));

    expect(window.confirm).toHaveBeenCalledOnce();
    expect(mockMutateAsync).toHaveBeenCalledTimes(2);
    expect(mockMutateAsync).toHaveBeenCalledWith("b1");
    expect(mockMutateAsync).toHaveBeenCalledWith("b2");
  });
});
