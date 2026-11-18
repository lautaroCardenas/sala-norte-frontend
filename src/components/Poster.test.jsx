import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Poster from "./Poster";

describe("Póster", () => {
  it("si la imagen no carga muestra el título en su lugar", () => {
    const movie = { id: 8, title: "Avengers: Endgame", poster_url: "https://api.example.com/poster.webp" };
    const { container } = render(<Poster movie={movie} tag="+13" />);

    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", movie.poster_url);

    fireEvent.error(img);

    expect(container.querySelector("img")).toBeNull();
    expect(screen.getByText("Avengers: Endgame")).toBeInTheDocument();
  });
});
