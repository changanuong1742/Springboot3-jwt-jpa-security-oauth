package com.pos.app.repositories;

import com.pos.app.models.Image;
import com.pos.app.models.Product;
import com.pos.app.models.Token;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ImageRepository extends JpaRepository<Image, Long> {
    Optional<Image> findByFileName(String fileName);
    Image findFirstByModelIdAndModeName(Integer modelId, String modeName);
    List<Image> findByModelIdAndModeName(Integer modelId, String modeName);

    @Modifying
    @Query("DELETE FROM Image i WHERE i.modelId = :id AND i.modeName = :name")
    void deleteByModelId(@Param("id") Integer id, @Param("name") String name);
}
