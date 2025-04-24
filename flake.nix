{
  description = "A Nix-flake-based Node.js development environment";

  inputs = { 
      nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
      nixpkgs-nodejs.url = "github:NixOS/nixpkgs/b2b0718004cc9a5bca610326de0a82e6ea75920b"; # node 23.11.0
  };

  outputs = { self, nixpkgs,... }@inputs:
    let
      supportedSystems = [ "x86_64-linux" "aarch64-linux" "x86_64-darwin" "aarch64-darwin" ];
      forEachSupportedSystem = f: nixpkgs.lib.genAttrs supportedSystems (system: f {
        pkgs = import nixpkgs { inherit system; };
      });
    in
    {
      devShells = forEachSupportedSystem ({ pkgs }: {
        default = pkgs.mkShell {
          packages = with pkgs; [ 
          inputs.nixpkgs-nodejs.legacyPackages.${system}.nodejs_23
          typescript-language-server 
          tailwindcss-language-server 
          astro-language-server 
          prettierd
          ];
        };
      });
    };
}
