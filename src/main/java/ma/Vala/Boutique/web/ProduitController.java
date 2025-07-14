package ma.Vala.Boutique.web;

import jakarta.validation.Valid;
import ma.Vala.Boutique.entities.Produit;
import ma.Vala.Boutique.repository.ProduitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Controller
public class ProduitController {

    @Autowired
    private ProduitRepository produitRepository;

    @GetMapping("/user/index")
    public String index(Model model,
                        @RequestParam(name = "page", defaultValue = "0") int page,
                        @RequestParam(name = "size", defaultValue = "4") int size,
                        @RequestParam(name = "keyword", defaultValue = "") String keyword) {

        Page<Produit> produits = produitRepository.findByNomContainsIgnoreCase(keyword, PageRequest.of(page, size));

        model.addAttribute("listProduits", produits.getContent());
        model.addAttribute("pages", new int[produits.getTotalPages()]);
        model.addAttribute("currentPage", page);
        model.addAttribute("keyword", keyword);

        return "produits";
    }

    @GetMapping("/admin/deleteProduit")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String delete(@RequestParam(name = "id") Long id,
                         @RequestParam(name = "keyword") String keyword,
                         @RequestParam(name = "page") int page) {

        produitRepository.deleteById(id);
        return "redirect:/user/index?page=" + page + "&keyword=" + keyword;
    }

    @GetMapping("/")
    public String home() {
        return "redirect:/user/index";
    }

    @GetMapping("/Produits")
    @ResponseBody
    public List<Produit> listProduits() {
        return produitRepository.findAll();
    }

    @GetMapping("/admin/formProduits")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String formProduits(Model model) {
        model.addAttribute("produit", new Produit());
        return "formProduits";
    }

    @PostMapping("/admin/save")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String saveProduit(Model model,
                              @Valid @ModelAttribute Produit produit,
                              BindingResult bindingResult ,
                              @RequestParam(defaultValue = "0") int page,
                              @RequestParam(defaultValue = "") String keyword,
                              @RequestParam("image") MultipartFile imageFile){
        if (bindingResult.hasErrors()) {
            return "formProduits";
        }

        try {
            if (!imageFile.isEmpty()) {
                // Spécifie un dossier pour stocker l'image (ex. dans /uploads)
                String uploadDir = System.getProperty("user.dir") + "/src/main/resources/static/images";
                Files.createDirectories(Paths.get(uploadDir));
                String fileName = imageFile.getOriginalFilename();
                Path filePath = Paths.get(uploadDir, fileName);
                imageFile.transferTo(filePath.toFile());

                // Enregistre le chemin dans l'attribut imageUrl
                produit.setImageUrl("/images/" + fileName);
            }
        } catch (Exception e) {
            e.printStackTrace();
            model.addAttribute("uploadError", "Erreur lors de l'upload de l'image");
            return "formProduits";
        }

        produitRepository.save(produit);
        return "redirect:/user/index?page=" + page + "&keyword=" + keyword;
    }
    @GetMapping("/admin/editProduit")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    public String editProduit(Model model , @RequestParam Long id, String keyword, int page) {
        Produit produit = produitRepository.findById(id).orElse(null);
        if (produit == null) throw new RuntimeException("Produit introuvable");
        model.addAttribute("produit", produit);
        model.addAttribute("page",page);
        model.addAttribute("keyword",keyword);
        return "editProduit";
    }

}

