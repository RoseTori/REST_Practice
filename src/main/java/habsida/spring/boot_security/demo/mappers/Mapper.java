package habsida.spring.boot_security.demo.mappers;

public interface Mapper<A,B> {
    B mapTo(A a);

    A mapFrom(B b);
}
